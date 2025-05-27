import React, { useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import {
  Bold,
  Italic,
  Underline as LucidUnderline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Undo,
  Redo,
  Save,
  Eye,
  FileText,
} from 'lucide-react';

// Komponen TiptapEditor sekarang menerima props tambahan: name dan required
const TiptapEditor = ({
  name, // Prop baru untuk nama field (berguna untuk form)
  value, // Konten editor saat ini (dikontrol oleh parent)
  onChange, // Callback saat konten berubah
  placeholder = 'Mulai menulis sesuatu yang menarik...', // Placeholder default
  required = false, // Prop baru, defaultnya false
}) => {
  const [isPreview, setIsPreview] = React.useState(false);
  const [savedContent, setSavedContent] = React.useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-700 underline cursor-pointer',
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: { class: 'max-w-full h-auto rounded-lg my-4' },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: { class: 'bg-yellow-200 px-1 rounded' },
      }),
      Typography,
      Placeholder.configure({
        placeholder: placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      CharacterCount.configure({ limit: 10000 }),
    ],
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl focus:outline-none w-full max-w-none p-6',
      },
    },
    content: value || '',
    onUpdate: ({ editor: currentEditor }) => {
      const html = currentEditor.getHTML();
      if (onChange) {
        onChange({
          target: {
            name: name, // 'name' dari props TiptapEditor
            value: html, // 'html' adalah konten terbaru
          },
        }); // Kirim HTML ke parent
        // Jika menggunakan input tersembunyi, Anda mungkin tidak perlu lagi memanggil onChange untuk itu secara manual
        // karena value input tersembunyi akan disinkronkan dengan prop 'value'.
      }
    },
  });

  useEffect(() => {
    if (editor && value !== undefined) {
      const editorHtml = editor.getHTML();
      if (editorHtml !== value) {
        editor.commands.setContent(value, false);
      }
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt(
      'Masukkan URL (kosongkan untuk menghapus link):',
      previousUrl,
    );
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url, target: '_blank' })
      .run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Masukkan URL Gambar:');
    if (url) {
      editor.chain().focus().setImage({ src: url, alt: 'Gambar' }).run();
    }
  }, [editor]);

  const saveContent = () => {
    const currentEditorContent = editor?.getHTML() || '';
    setSavedContent(currentEditorContent);
    alert(
      'Konten berhasil disimpan secara lokal di komponen Tiptap! (cek konsol)',
    );
  };

  const loadSavedContent = () => {
    if (savedContent && editor) {
      editor.commands.setContent(savedContent);
      if (onChange) {
        onChange(savedContent); // Update parent juga jika memuat konten lokal
      }
      alert('Konten berhasil dimuat!');
    } else {
      alert('Tidak ada konten yang tersimpan untuk dimuat!');
    }
  };

  if (!editor) {
    return (
      <div className="flex justify-center items-center h-32 text-gray-500">
        Memuat editor...
      </div>
    );
  }

  const ToolbarButton = ({
    onClick,
    isActive,
    children,
    title,
    disabled = false,
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={!editor || disabled}
      className={`p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        isActive
          ? 'bg-blue-100 text-blue-700 border border-blue-300'
          : 'hover:bg-gray-100 border border-transparent'
      }`}
      title={title}
    >
      {children}
    </button>
  );

  const ToolbarDivider = () => (
    <div className="w-px h-6 bg-gray-300 mx-1"></div>
  );

  return (
    <div className="tiptap-editor-wrapper">
      {' '}
      {/* Tambahkan kelas wrapper jika perlu untuk styling global */}
      {/* Input tersembunyi untuk integrasi form HTML standar */}
      {/* Ini akan mengirimkan value HTML mentah. Validasi 'required' pada HTML mentah mungkin perlu logika khusus. */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={value || ''} // Pastikan selalu string
          required={required}
          // Anda bisa menambahkan ref di sini jika perlu diakses secara langsung,
          // tapi biasanya tidak diperlukan jika form dikelola oleh React.
        />
      )}
      {/* Bagian UI Editor yang sudah ada */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white shadow-lg rounded-xl">
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            Tiptap Rich Text Editor
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Editor teks lengkap dengan berbagai fitur formatting dan Tailwind
            CSS.
          </p>
        </div>

        {/* Toolbar */}
        <div className="border border-gray-200 rounded-t-lg bg-gray-50 p-2 sm:p-3 sticky top-0 z-10">
          <div className="flex flex-wrap items-center gap-0.5 sm:gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Bold"
              disabled={!editor.can().toggleBold()}
            >
              <Bold size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Italic"
              disabled={!editor.can().toggleItalic()}
            >
              <Italic size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              title="Underline"
              disabled={!editor.can().toggleUnderline()}
            >
              <LucidUnderline size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              title="Strikethrough"
              disabled={!editor.can().toggleStrike()}
            >
              <Strikethrough size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              isActive={editor.isActive('highlight')}
              title="Highlight"
              disabled={!editor.can().toggleHighlight()}
            >
              <Highlighter size={16} />
            </ToolbarButton>
            <ToolbarDivider />
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              isActive={editor.isActive('heading', { level: 1 })}
              title="Heading 1"
              disabled={!editor.can().toggleHeading({ level: 1 })}
            >
              <Heading1 size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              isActive={editor.isActive('heading', { level: 2 })}
              title="Heading 2"
              disabled={!editor.can().toggleHeading({ level: 2 })}
            >
              <Heading2 size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              isActive={editor.isActive('heading', { level: 3 })}
              title="Heading 3"
              disabled={!editor.can().toggleHeading({ level: 3 })}
            >
              <Heading3 size={16} />
            </ToolbarButton>
            <ToolbarDivider />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="Bullet List"
              disabled={!editor.can().toggleBulletList()}
            >
              <List size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              title="Ordered List"
              disabled={!editor.can().toggleOrderedList()}
            >
              <ListOrdered size={16} />
            </ToolbarButton>
            <ToolbarDivider />
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={editor.isActive({ textAlign: 'left' })}
              title="Align Left"
            >
              <AlignLeft size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().setTextAlign('center').run()
              }
              isActive={editor.isActive({ textAlign: 'center' })}
              title="Align Center"
            >
              <AlignCenter size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={editor.isActive({ textAlign: 'right' })}
              title="Align Right"
            >
              <AlignRight size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().setTextAlign('justify').run()
              }
              isActive={editor.isActive({ textAlign: 'justify' })}
              title="Justify"
            >
              <AlignJustify size={16} />
            </ToolbarButton>
            <ToolbarDivider />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              title="Blockquote"
              disabled={!editor.can().toggleBlockquote()}
            >
              <Quote size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              isActive={editor.isActive('codeBlock')}
              title="Code Block"
              disabled={!editor.can().toggleCodeBlock()}
            >
              <Code size={16} />
            </ToolbarButton>
            <ToolbarDivider />
            <ToolbarButton
              onClick={setLink}
              isActive={editor.isActive('link')}
              title="Add Link"
            >
              <Link2 size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={addImage} title="Add Image">
              <ImageIcon size={16} />
            </ToolbarButton>
            <ToolbarDivider />
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              title="Undo"
              disabled={!editor.can().undo()}
            >
              <Undo size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              title="Redo"
              disabled={!editor.can().redo()}
            >
              <Redo size={16} />
            </ToolbarButton>
            <ToolbarDivider />
            <ToolbarButton
              onClick={() => setIsPreview(!isPreview)}
              isActive={isPreview}
              title={isPreview ? 'Edit Mode' : 'Preview Mode'}
            >
              <Eye size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={saveContent} title="Save Content">
              <Save size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={loadSavedContent}
              title="Load Saved Content"
            >
              <FileText size={16} />
            </ToolbarButton>
          </div>
        </div>

        {/* Editor Content Wrapper */}
        <div className="border border-gray-200 border-t-0 rounded-b-lg">
          {isPreview ? (
            <div className="bg-gray-50 min-h-[24rem]">
              <div className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">
                  Preview Konten:
                </h3>
                <div
                  className="prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: editor?.getHTML() || value || '',
                  }}
                />
              </div>
            </div>
          ) : (
            <EditorContent
              editor={editor}
              className="min-h-[24rem] focus-within:bg-gray-50 transition-colors"
            />
          )}
        </div>

        {/* Status Bar */}
        <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs sm:text-sm">
          <div className="flex flex-wrap justify-between items-center text-gray-600 gap-2">
            <div>
              Karakter: {editor?.storage.characterCount?.characters() || 0} /
              10000
              <span className="mx-2">|</span>
              Kata: {editor?.storage.characterCount?.words() || 0}
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span>
                Mode:{' '}
                <span className="font-semibold">
                  {isPreview ? 'Preview' : 'Edit'}
                </span>
              </span>
              {savedContent && (
                <span className="text-green-600">✓ Tersimpan (Lokal)</span>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Cara Penggunaan:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Gunakan toolbar di atas untuk memformat teks Anda.</li>
            <li>
              • Klik ikon link (
              <Link2 size={12} className="inline-block -mt-0.5" />) untuk
              menambahkan atau mengedit hyperlink.
            </li>
            <li>
              • Klik ikon gambar (
              <ImageIcon size={12} className="inline-block -mt-0.5" />) untuk
              menambahkan gambar dari URL.
            </li>
            <li>
              • Beralih antara mode Edit dan Preview menggunakan ikon mata (
              <Eye size={12} className="inline-block -mt-0.5" />
              ).
            </li>
            <li>
              • Gunakan tombol (
              <Save size={12} className="inline-block -mt-0.5" />) untuk
              menyimpan dan (
              <FileText size={12} className="inline-block -mt-0.5" />) untuk
              memuat konten.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TiptapEditor;
