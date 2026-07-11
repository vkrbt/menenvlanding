#!/usr/bin/env python3
"""Download YouTube channel video transcripts into markdown files."""

from __future__ import annotations

import argparse
import re
import subprocess
import time
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    NoTranscriptFound,
    TranscriptsDisabled,
    VideoUnavailable,
)

PREFERRED_LANGS = ["en", "en-US", "en-GB"]
MAX_RETRIES = 5


@dataclass
class Video:
    video_id: str
    title: str


@dataclass
class TranscriptResult:
    language: str
    is_generated: bool
    segments: list[dict]
    text: str


def slugify(text: str, max_len: int = 80) -> str:
    text = text.strip().lower()
    text = re.sub(r"[^\w\s-]", "", text, flags=re.UNICODE)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text).strip("-")
    if len(text) > max_len:
        text = text[:max_len].rstrip("-")
    return text or "video"


def list_channel_videos(channel_url: str) -> list[Video]:
    cmd = [
        "yt-dlp",
        "--flat-playlist",
        "--print",
        "%(id)s\t%(title)s",
        channel_url,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    videos: list[Video] = []
    for line in result.stdout.splitlines():
        if not line.strip():
            continue
        video_id, title = line.split("\t", 1)
        videos.append(Video(video_id=video_id.strip(), title=title.strip()))
    return videos


def format_timestamp(seconds: float) -> str:
    total = int(seconds)
    hours, rem = divmod(total, 3600)
    minutes, secs = divmod(rem, 60)
    if hours:
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"
    return f"{minutes:02d}:{secs:02d}"


def merge_segments(segments: list) -> str:
    parts: list[str] = []
    for seg in segments:
        text = seg.text.strip()
        if not text:
            continue
        if parts and not parts[-1].endswith((".", "!", "?", "…")):
            parts.append(" " + text)
        else:
            parts.append(text)
    merged = "".join(parts)
    merged = re.sub(r"\s+", " ", merged).strip()
    return merged


def fetch_transcript(api: YouTubeTranscriptApi, video_id: str) -> TranscriptResult:
    last_error: Exception | None = None
    for attempt in range(MAX_RETRIES):
        try:
            return _fetch_transcript_once(api, video_id)
        except (TranscriptsDisabled, VideoUnavailable, NoTranscriptFound):
            raise
        except Exception as exc:
            last_error = exc
            message = str(exc).lower()
            if "ip" in message or "blocked" in message or "too many" in message:
                wait = min(30, 3 * (attempt + 1))
                print(f"  retry {attempt + 1}/{MAX_RETRIES} after {wait}s...")
                time.sleep(wait)
                continue
            raise
    if last_error:
        raise last_error
    raise RuntimeError(f"Failed to fetch transcript for {video_id}")


def _fetch_transcript_once(api: YouTubeTranscriptApi, video_id: str) -> TranscriptResult:
    transcript_list = api.list(video_id)

    transcript = None
    language = ""
    is_generated = False

    for lang in PREFERRED_LANGS:
        try:
            transcript = transcript_list.find_transcript([lang])
            language = lang
            break
        except NoTranscriptFound:
            continue

    if transcript is None:
        for t in transcript_list:
            if not t.is_translatable and t.language_code.startswith("en"):
                transcript = t
                language = t.language_code
                break
        if transcript is None:
            transcript = next(iter(transcript_list))
            language = transcript.language_code

    is_generated = transcript.is_generated
    fetched = transcript.fetch()
    segments = [
        {"start": seg.start, "duration": seg.duration, "text": seg.text}
        for seg in fetched
    ]
    return TranscriptResult(
        language=language,
        is_generated=is_generated,
        segments=segments,
        text=merge_segments(fetched),
    )


def video_to_markdown(video: Video, transcript: TranscriptResult | None, error: str | None) -> str:
    url = f"https://www.youtube.com/watch?v={video.video_id}"
    title = video.title.replace('"', '\\"')

    lines = [
        "---",
        f"id: {video.video_id}",
        f'title: "{title}"',
        f"url: {url}",
        f"channel: wearemanenough",
    ]

    if transcript:
        lines.append(f'language: "{transcript.language}"')
        lines.append(f"auto_generated: {str(transcript.is_generated).lower()}")
        lines.append(f"segments: {len(transcript.segments)}")
    elif error:
        lines.append(f'error: "{error}"')

    lines.append("---")
    lines.append("")

    if transcript:
        lines.append("## Транскрипция")
        lines.append("")
        lines.append(transcript.text)
        lines.append("")
        lines.append("## С таймкодами")
        lines.append("")
        for seg in transcript.segments:
            ts = format_timestamp(seg["start"])
            lines.append(f"**[{ts}]** {seg['text'].strip()}")
    else:
        lines.append(f"*{error or 'Транскрипция недоступна'}*")

    lines.append("")
    return "\n".join(lines)


def save_videos(
    results: list[tuple[Video, TranscriptResult | None, str | None]],
    out_dir: Path,
) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)

    for video, transcript, error in results:
        slug = slugify(video.title)
        filename = f"{video.video_id}-{slug}.md"
        if len(filename) > 120:
            filename = f"{video.video_id}.md"
        (out_dir / filename).write_text(
            video_to_markdown(video, transcript, error),
            encoding="utf-8",
        )

    rebuild_index(results, out_dir)


def load_existing_results(out_dir: Path) -> dict[str, tuple[Video, TranscriptResult | None, str | None]]:
    results: dict[str, tuple[Video, TranscriptResult | None, str | None]] = {}
    for path in sorted(out_dir.glob("*.md")):
        if path.name == "index.md":
            continue
        text = path.read_text(encoding="utf-8")
        parts = text.split("---", 2)
        if len(parts) < 3:
            continue
        header = parts[1]
        body = parts[2]
        video_id = re.search(r"^id: (\S+)", header, re.M)
        title = re.search(r'^title: "(.*)"', header, re.M)
        if not video_id:
            continue
        video = Video(video_id.group(1), title.group(1) if title else video_id.group(1))
        if "## Транскрипция" in body:
            lang = re.search(r'^language: "(.*)"', header, re.M)
            auto = re.search(r"^auto_generated: (\w+)", header, re.M)
            segments_match = re.search(r"^segments: (\d+)", header, re.M)
            transcript_text = body.split("## Транскрипция", 1)[1].split("## С таймкодами", 1)[0].strip()
            timed_part = body.split("## С таймкодами", 1)[1] if "## С таймкодами" in body else ""
            segments: list[dict] = []
            for line in timed_part.splitlines():
                match = re.match(r"\*\*\[(\d+:\d+(?::\d+)?)\]\*\* (.+)", line.strip())
                if match:
                    segments.append({"start": 0.0, "duration": 0.0, "text": match.group(2)})
            results[video.video_id] = (
                video,
                TranscriptResult(
                    language=lang.group(1) if lang else "en",
                    is_generated=(auto.group(1) == "true") if auto else True,
                    segments=segments,
                    text=transcript_text,
                ),
                None,
            )
        else:
            err = re.search(r'^error: "(.*)"', header, re.M)
            results[video.video_id] = (video, None, err.group(1) if err else "unknown error")
    return results


def rebuild_index(results: list[tuple[Video, TranscriptResult | None, str | None]], out_dir: Path) -> None:
    ok = sum(1 for _, t, _ in results if t)
    index_lines = [
        "# We Are Man Enough — транскрипции YouTube",
        "",
        "Источник: [youtube.com/@wearemanenough](https://www.youtube.com/@wearemanenough)",
        f"Видео: {len(results)}",
        f"С транскрипцией: {ok}",
        f"Выгружено: {datetime.now().isoformat(timespec='seconds')}",
        "",
        "## Видео",
        "",
    ]
    for video, transcript, error in results:
        slug = slugify(video.title)
        fname = f"{video.video_id}-{slug}.md"
        if len(fname) > 120:
            fname = f"{video.video_id}.md"
        status = "✓" if transcript else "✗"
        index_lines.append(
            f"- {status} [{video.title}]({fname}) — [YouTube](https://www.youtube.com/watch?v={video.video_id})"
        )
        if error:
            index_lines.append(f"  - _{error[:120]}_")
    (out_dir / "index.md").write_text("\n".join(index_lines) + "\n", encoding="utf-8")


def scrape_videos(
    videos: list[Video],
    delay: float = 1.0,
) -> list[tuple[Video, TranscriptResult | None, str | None]]:
    api = YouTubeTranscriptApi()
    results: list[tuple[Video, TranscriptResult | None, str | None]] = []

    for i, video in enumerate(videos, 1):
        print(f"[{i}/{len(videos)}] {video.video_id} — {video.title[:60]}")
        try:
            transcript = fetch_transcript(api, video.video_id)
            results.append((video, transcript, None))
            print(f"  OK: {len(transcript.segments)} segments, {len(transcript.text)} chars")
        except TranscriptsDisabled:
            results.append((video, None, "Субтитры отключены"))
            print("  SKIP: transcripts disabled")
        except VideoUnavailable:
            results.append((video, None, "Видео недоступно"))
            print("  SKIP: video unavailable")
        except NoTranscriptFound:
            results.append((video, None, "Транскрипция не найдена"))
            print("  SKIP: no transcript")
        except Exception as exc:
            results.append((video, None, str(exc)))
            print(f"  ERROR: {exc}")

        if i < len(videos):
            time.sleep(delay)

    return results


def scrape_channel(channel_url: str, delay: float = 1.5) -> list[tuple[Video, TranscriptResult | None, str | None]]:
    videos = list_channel_videos(channel_url)
    return scrape_videos(videos, delay=delay)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "channel_url",
        nargs="?",
        default="https://www.youtube.com/@wearemanenough",
    )
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=Path("youtube/wearemanenough"),
    )
    parser.add_argument("--delay", type=float, default=1.5)
    parser.add_argument(
        "--retry-failed",
        action="store_true",
        help="Retry only videos that failed in a previous run",
    )
    args = parser.parse_args()

    if args.retry_failed:
        existing = load_existing_results(args.output)
        failed = [video for video, _, err in existing.values() if err]
        if not failed:
            print("No failed videos to retry.")
            return
        print(f"Retrying {len(failed)} failed videos...")
        fresh = scrape_videos(failed, delay=args.delay)
        for video, transcript, error in fresh:
            if transcript:
                existing[video.video_id] = (video, transcript, None)
            else:
                existing[video.video_id] = (video, None, error)
        channel_videos = list_channel_videos(args.channel_url)
        order = {v.video_id: i for i, v in enumerate(channel_videos)}
        results = sorted(existing.values(), key=lambda item: order.get(item[0].video_id, 9999))
    else:
        print(f"Fetching video list from {args.channel_url}...")
        results = scrape_channel(args.channel_url, delay=args.delay)

    save_videos(results, args.output)
    ok = sum(1 for _, t, _ in results if t)
    print(f"Done: {ok}/{len(results)} transcripts saved to {args.output.resolve()}")


if __name__ == "__main__":
    main()
