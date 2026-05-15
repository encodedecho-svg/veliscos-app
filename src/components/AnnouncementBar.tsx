"use client";

import { useEffect, useState } from "react";
import { getAnnouncement, type Announcement } from "@/lib/admin-promos";

export function AnnouncementBar() {
  const [ann, setAnn] = useState<Announcement | null>(null);

  useEffect(() => {
    getAnnouncement().then((a) => {
      if (a && a.status === "active" && a.text) setAnn(a);
    });
  }, []);

  if (!ann || !ann.text) return null;

  return (
    <div
      role="banner"
      style={{
        background: ann.bgColor || "#1a2a44",
        color: "white",
        padding: "10px 16px",
        textAlign: "center",
        fontSize: "0.85rem",
        fontWeight: 500,
        letterSpacing: "0.3px",
      }}
    >
      {ann.text}
    </div>
  );
}
