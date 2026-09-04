"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { addPhoto } from "@/app/extras/actions";

export default function PhotoUploader({ extraId }: { extraId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setBusy(true);
    setError(null);

    try {
      const list = Array.from(files);
      for (const [index, file] of list.entries()) {
        setProgress(`Uploading ${index + 1} of ${list.length}…`);
        const blob = await upload(`extras/${extraId}/${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/photos/upload",
        });

        const formData = new FormData();
        formData.set("extraId", extraId);
        formData.set("url", blob.url);
        formData.set("pathname", blob.pathname);
        await addPhoto(formData);
      }
      router.refresh();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed",
      );
    } finally {
      setBusy(false);
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => handleFiles(event.target.files)}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 transition hover:border-neutral-500 hover:text-white disabled:opacity-60"
      >
        {busy ? (progress ?? "Uploading…") : "Upload photos"}
      </button>
      {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
