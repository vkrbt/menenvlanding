#!/usr/bin/env python3
"""Scrape public Telegram channel posts into markdown files."""

from __future__ import annotations

import argparse
import re
import time
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup, NavigableString, Tag

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
}

SKIP_LINK_PREFIXES = (
    "https://t.me/menmasculinities/",
    "http://t.me/menmasculinities/",
)


@dataclass
class Post:
    post_id: int
    channel: str
    date: datetime
    url: str
    views: str | None
    text_md: str
    links: list[str] = field(default_factory=list)
    forwarded_from: str | None = None
    media_urls: list[str] = field(default_factory=list)


def slugify(text: str, max_len: int = 80) -> str:
    text = text.strip().lower()
    text = re.sub(r"[^\w\s-]", "", text, flags=re.UNICODE)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text).strip("-")
    if len(text) > max_len:
        text = text[:max_len].rstrip("-")
    return text or "post"


def html_inline_to_md(node: Tag | NavigableString) -> str:
    if isinstance(node, NavigableString):
        return str(node)

    name = node.name
    children = "".join(html_inline_to_md(c) for c in node.children)

    if name == "br":
        return "\n"
    if name == "a":
        href = node.get("href", "")
        label = children.strip() or href
        if href:
            return f"[{label}]({href})"
        return label
    if name in ("b", "strong"):
        inner = children.rstrip("\n")
        return f"**{inner}**"
    if name in ("i", "em"):
        return f"*{children}*"
    if name == "code":
        return f"`{children}`"
    if name == "s":
        return f"~~{children}~~"
    if name == "u":
        return children
    if name == "tg-spoiler":
        return f"||{children}||"
    if name == "blockquote":
        lines = [ln.strip() for ln in children.strip().splitlines() if ln.strip()]
        return "\n".join(f"> {ln}" for ln in lines)
    if name == "pre":
        return f"```\n{children.strip()}\n```"
    return children


def message_text_to_md(text_div: Tag) -> str:
    parts: list[str] = []
    for child in text_div.children:
        if isinstance(child, Tag) and child.name == "br":
            parts.append("\n")
            continue
        chunk = html_inline_to_md(child)
        if chunk:
            parts.append(chunk)
    md = "".join(parts)
    md = re.sub(r"\n{3,}", "\n\n", md)
    # Lines with unclosed bold (Telegram puts <br> inside <b>).
    fixed_lines = []
    for line in md.split("\n"):
        if line.startswith("**") and line.count("**") == 1:
            line += "**"
        fixed_lines.append(line)
    md = "\n".join(fixed_lines)
    return md.strip()


def extract_media_urls(post: Tag) -> list[str]:
    urls: list[str] = []
    for el in post.select(
        ".tgme_widget_message_photo_wrap, .tgme_widget_message_video_wrap"
    ):
        style = el.get("style", "")
        match = re.search(r"url\('([^']+)'\)", style)
        if match:
            urls.append(match.group(1))
    for img in post.select("i.tgme_widget_message_video_thumb, img"):
        src = img.get("src")
        if src and "telesco.pe" in src:
            urls.append(src)
    return list(dict.fromkeys(urls))


def is_post_link(href: str, channel: str) -> bool:
    if not href:
        return True
    normalized = href.replace("http://", "https://")
    if normalized in (f"https://t.me/{channel}", f"https://t.me/s/{channel}"):
        return True
    if normalized.startswith(f"https://t.me/{channel}/"):
        suffix = normalized.split("/")[-1]
        return suffix.isdigit()
    if normalized.startswith(f"https://t.me/s/{channel}/"):
        suffix = normalized.split("/")[-1]
        return suffix.isdigit()
    return False


def extract_links(post: Tag, channel: str, post_url: str) -> list[str]:
    found: list[str] = []
    for anchor in post.find_all("a", href=True):
        href = anchor["href"].strip()
        if not href or href == post_url:
            continue
        if is_post_link(href, channel):
            continue
        classes = anchor.parent.get("class", []) if anchor.parent else []
        if any(
            cls in classes
            for cls in (
                "tgme_widget_message_user",
                "tgme_widget_message_author",
                "tgme_widget_message_forwarded_from",
            )
        ):
            continue
        found.append(href)
    return list(dict.fromkeys(found))


def parse_post(post: Tag, channel: str) -> Post | None:
    data_post = post.get("data-post")
    if not data_post:
        return None

    post_channel, post_id_str = data_post.rsplit("/", 1)
    if post_channel != channel or not post_id_str.isdigit():
        return None

    post_id = int(post_id_str)
    footer = post.find("div", class_="tgme_widget_message_footer")
    if not footer:
        return None

    date_link = footer.find("a", class_="tgme_widget_message_date")
    if not date_link:
        return None

    post_url = date_link["href"]
    time_el = date_link.find("time")
    if not time_el or not time_el.get("datetime"):
        return None

    date = datetime.fromisoformat(time_el["datetime"])

    views_el = footer.find("span", class_="tgme_widget_message_views")
    views = views_el.get_text(strip=True) if views_el else None

    text_div = post.find("div", class_="tgme_widget_message_text")
    text_md = message_text_to_md(text_div) if text_div else ""

    fwd = post.find("a", class_="tgme_widget_message_forwarded_from_name")
    forwarded_from = fwd.get_text(strip=True) if fwd else None

    media_urls = extract_media_urls(post)
    links = extract_links(post, channel, post_url)

    # Also pull bare URLs from text that might not be wrapped in <a>
    for match in re.findall(r"https?://[^\s\)\]>]+", text_md):
        clean = match.rstrip(".,;:")
        if clean not in links and not is_post_link(clean, channel):
            links.append(clean)

    return Post(
        post_id=post_id,
        channel=channel,
        date=date,
        url=post_url,
        views=views,
        text_md=text_md,
        links=links,
        forwarded_from=forwarded_from,
        media_urls=media_urls,
    )


def fetch_page(channel: str, before: int | None = None) -> str:
    url = f"https://t.me/s/{channel}"
    if before is not None:
        url += f"?before={before}"
    response = requests.get(url, headers=HEADERS, timeout=30)
    response.raise_for_status()
    return response.text


def scrape_channel(channel: str, delay: float = 0.35) -> list[Post]:
    posts_by_id: dict[int, Post] = {}
    before: int | None = None

    while True:
        html = fetch_page(channel, before=before)
        soup = BeautifulSoup(html, "lxml")
        blocks = soup.find_all(
            "div", class_="tgme_widget_message", attrs={"data-post": True}
        )
        if not blocks:
            break

        page_ids: list[int] = []
        for block in blocks:
            parsed = parse_post(block, channel)
            if parsed:
                posts_by_id[parsed.post_id] = parsed
                page_ids.append(parsed.post_id)

        if not page_ids:
            break

        oldest = min(page_ids)
        prev = soup.find("link", rel="prev")
        if not prev or before == oldest:
            break

        before = oldest
        time.sleep(delay)
        print(f"  fetched up to #{before}, total {len(posts_by_id)}")

    return [posts_by_id[k] for k in sorted(posts_by_id)]


def post_to_markdown(post: Post) -> str:
    title_source = post.text_md.split("\n", 1)[0].strip()
    title_source = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", title_source)
    title_source = re.sub(r"\*\*([^*]+)\*\*", r"\1", title_source)
    title = title_source[:120] if title_source else f"Пост {post.post_id}"

    lines = [
        "---",
        f"id: {post.post_id}",
        f"title: \"{title.replace('\"', '\\\"')}\"",
        f"date: {post.date.isoformat()}",
        f"url: {post.url}",
        f"channel: {post.channel}",
    ]
    if post.views:
        lines.append(f"views: \"{post.views}\"")
    if post.forwarded_from:
        lines.append(f"forwarded_from: \"{post.forwarded_from}\"")
    lines.append("---")
    lines.append("")

    if post.forwarded_from:
        lines.append(f"*Переслано из: {post.forwarded_from}*")
        lines.append("")

    if post.text_md:
        lines.append(post.text_md)
    elif post.media_urls:
        lines.append("*[Пост без текста — только медиа]*")
    else:
        lines.append("*[Пустой пост]*")

    if post.media_urls:
        lines.append("")
        lines.append("## Медиа")
        for media_url in post.media_urls:
            lines.append(f"- {media_url}")

    if post.links:
        lines.append("")
        lines.append("## Ссылки")
        for link in post.links:
            lines.append(f"- {link}")

    lines.append("")
    return "\n".join(lines)


def save_posts(posts: list[Post], out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)

    for post in posts:
        title_source = post.text_md.split("\n", 1)[0].strip()
        title_source = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", title_source)
        title_source = re.sub(r"\*\*([^*]+)\*\*", r"\1", title_source)
        slug = slugify(title_source) if title_source else "post"
        filename = f"{post.post_id:04d}-{slug}.md"
        if len(filename) > 120:
            filename = f"{post.post_id:04d}.md"
        (out_dir / filename).write_text(post_to_markdown(post), encoding="utf-8")

    index_lines = [
        "# Men & Masculinities — архив Telegram-канала",
        "",
        f"Источник: [t.me/menmasculinities](https://t.me/menmasculinities)",
        f"Постов: {len(posts)}",
        f"Выгружено: {datetime.now().isoformat(timespec='seconds')}",
        "",
        "## Посты",
        "",
    ]
    for post in reversed(posts):
        title_source = post.text_md.split("\n", 1)[0].strip()
        title_source = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", title_source)
        title_source = re.sub(r"\*\*([^*]+)\*\*", r"\1", title_source)
        title = title_source[:100] if title_source else f"Пост {post.post_id}"
        slug = slugify(title_source) if title_source else "post"
        fname = f"{post.post_id:04d}-{slug}.md"
        if len(fname) > 120:
            fname = f"{post.post_id:04d}.md"
        index_lines.append(
            f"- [{post.post_id} — {title}]({fname}) ({post.date.strftime('%Y-%m-%d')})"
        )

    (out_dir / "index.md").write_text("\n".join(index_lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("channel", nargs="?", default="menmasculinities")
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=Path("telegram/menmasculinities"),
    )
    parser.add_argument("--delay", type=float, default=0.35)
    args = parser.parse_args()

    print(f"Scraping @{args.channel}...")
    posts = scrape_channel(args.channel, delay=args.delay)
    print(f"Parsed {len(posts)} posts")

    save_posts(posts, args.output)
    print(f"Saved to {args.output.resolve()}")


if __name__ == "__main__":
    main()
