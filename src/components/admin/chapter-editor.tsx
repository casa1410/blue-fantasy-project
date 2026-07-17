"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { uploadChapterInlineImage } from "@/actions/chapters";
import { validateImageFile } from "@/lib/image-constraints";

export function ChapterEditor({
  novelId,
  chapterId,
  initialContent,
  onChange,
}: {
  novelId: string;
  chapterId: string;
  initialContent: string;
  onChange: (html: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: initialContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose max-w-none min-h-[300px] rounded-lg border border-(--admin-border) bg-(--admin-surface) px-4 py-3 focus:outline-none",
      },
    },
  });

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      alert(validationError);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const { url } = await uploadChapterInlineImage(novelId, chapterId, formData);
      editor.chain().focus().setImage({ src: url }).run();
    } catch {
      alert("Error subiendo la imagen. Si el archivo es grande, prueba con uno mas liviano.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (!editor) return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-(--admin-border) bg-(--admin-bg) p-2">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
          Negrita
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
          Cursiva
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
        >
          Titulo
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
          Lista
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
          Lista numerada
        </ToolbarButton>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded-md px-2 py-1 text-sm text-(--admin-ink-soft) hover:bg-(--admin-accent-soft) hover:text-(--admin-accent) disabled:opacity-50"
        >
          {uploading ? "Subiendo..." : "Insertar imagen"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImagePick}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-2 py-1 text-sm ${
        active
          ? "bg-(--admin-accent) text-white"
          : "text-(--admin-ink-soft) hover:bg-(--admin-accent-soft) hover:text-(--admin-accent)"
      }`}
    >
      {children}
    </button>
  );
}
