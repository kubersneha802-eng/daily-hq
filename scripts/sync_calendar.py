#!/usr/bin/env python3
"""
Fetches events from iCloud Calendar via CalDAV and writes them to
data/calendar.json so the static Daily HQ site can read them.
"""

import caldav
import json
import os
import sys
from datetime import datetime, timedelta, date, timezone

USERNAME = os.environ.get("ICLOUD_USERNAME", "")
PASSWORD = os.environ.get("ICLOUD_PASSWORD", "")

if not USERNAME or not PASSWORD:
    print("ERROR: Set ICLOUD_USERNAME and ICLOUD_PASSWORD env vars / GitHub Secrets.")
    sys.exit(1)

print(f"Connecting to iCloud CalDAV as {USERNAME}...")

try:
    client = caldav.DAVClient(
        url="https://caldav.icloud.com",
        username=USERNAME,
        password=PASSWORD,
    )
    principal = client.principal()
    calendars = principal.calendars()
    print(f"Found {len(calendars)} calendar(s).")
except Exception as exc:
    print(f"ERROR: Could not connect — {exc}")
    sys.exit(1)

now = datetime.now(timezone.utc)
end = now + timedelta(days=60)
events = []

for cal in calendars:
    try:
        results = cal.date_search(start=now, end=end, expand=True)
        for item in results:
            try:
                vobj = item.vobject_instance
                for ve in vobj.vevent_list:
                    raw_start = ve.dtstart.value
                    raw_end   = getattr(ve, "dtend", None)

                    all_day = isinstance(raw_start, date) and not isinstance(raw_start, datetime)

                    if all_day:
                        start_iso = raw_start.isoformat()
                        end_val   = raw_end.value if raw_end else raw_start
                        end_iso   = end_val.isoformat()
                    else:
                        if raw_start.tzinfo is None:
                            raw_start = raw_start.replace(tzinfo=timezone.utc)
                        start_iso = raw_start.isoformat()
                        end_val = raw_end.value if raw_end else raw_start
                        if hasattr(end_val, "tzinfo") and end_val.tzinfo is None:
                            end_val = end_val.replace(tzinfo=timezone.utc)
                        end_iso = end_val.isoformat()

                    title    = str(ve.summary.value)  if hasattr(ve, "summary")  else "(No title)"
                    location = str(ve.location.value) if hasattr(ve, "location") else ""

                    events.append({
                        "title":    title,
                        "start":    start_iso,
                        "end":      end_iso,
                        "allDay":   all_day,
                        "location": location,
                        "calendar": str(cal.name or ""),
                    })
            except Exception as e:
                print(f"  Skipping event: {e}")
    except Exception as e:
        print(f"Error reading calendar '{cal.name}': {e}")

events.sort(key=lambda e: e["start"])

output = {
    "updated": datetime.now(timezone.utc).isoformat(),
    "events":  events,
}

os.makedirs("data", exist_ok=True)
with open("data/calendar.json", "w") as f:
    json.dump(output, f, indent=2)

print(f"Wrote {len(events)} events to data/calendar.json")
