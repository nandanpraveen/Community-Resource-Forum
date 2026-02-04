import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getSession } from "~/server/auth";
import { db } from "~/server/db";
import { profiles } from "~/server/db/schema/tables";

export async function POST(req: Request) {
  const session = await getSession({
    user: {
      with: {
        profile: {
          with: {
            events: true,
          },
        },
        organizationOwnerships: {
          with: {
            profile: {
              with: {
                events: true,
              },
            },
          },
        },
      },
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.formData();
  const id = body.get("id");
  const name = body.get("name");
  const bio = body.get("bio");
  const image = body.get("image");
  const linkedin = body.get("linkedin");
  const github = body.get("github");
  const personalSite = body.get("personalSite");

  const profile =
    session &&
    (id === session.userProfileId
      ? session.user.profile
      : session.user.organizationOwnerships.find(
          (org) => org.organizationProfileId === id,
        )?.profile.events);

  if (!profile || !id || typeof id !== "string") {
    return NextResponse.json({ error: "Invalid profile id" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  if (typeof name === "string") updates.name = name;
  if (typeof bio === "string") updates.bio = bio;
  if (typeof image === "string") updates.image = image;
  if (typeof personalSite === "string" && personalSite.length <= 255)
    updates.personalSite = personalSite;

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isValidLinkedIn = (url: string) => {
    return (
      typeof url === "string" &&
      url.length <= 255 &&
      isValidUrl(url) &&
      (url.startsWith("https://www.linkedin.com/") ||
        url.startsWith("https://linkedin.com/")) &&
      /^https:\/\/(www\.)?linkedin\.com\/.*$/.test(url)
    );
  };

  const isValidGitHub = (url: string) => {
    return (
      typeof url === "string" &&
      url.length <= 255 &&
      isValidUrl(url) &&
      (url.startsWith("https://github.com/") ||
        url.startsWith("https://www.github.com/")) &&
      /^https:\/\/(www\.)?github\.com\/[A-Za-z0-9_-]+\/?$/.test(url)
    );
  };

  if (typeof linkedin === "string" && isValidLinkedIn(linkedin))
    updates.linkedin = linkedin;
  if (typeof github === "string" && isValidGitHub(github))
    updates.github = github;

  try {
    await db.update(profiles).set(updates).where(eq(profiles.id, id));
    return NextResponse.redirect(new URL("/", req.url));
  } catch (err) {
    return NextResponse.json(
      { error: "Update failed", details: String(err) },
      { status: 500 },
    );
  }
}
