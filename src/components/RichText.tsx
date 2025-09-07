import { RichTextEditor, Link } from '@mantine/tiptap'
import { useEditor } from '@tiptap/react'
import Highlight from '@tiptap/extension-highlight'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Superscript from '@tiptap/extension-superscript'
import SubScript from '@tiptap/extension-subscript'
import { useState } from 'react'

export function RichText({value, patchProps} : {value: string, patchProps: (patch : any) => void }) {
	const [, setIsFocused] = useState(false);

	const editor = useEditor({
		extensions: [
			StarterKit,
			Underline,
			Link,
			Superscript,
			SubScript,
			Highlight,
			TextAlign.configure({types: ['heading', 'paragraph']}),
		],
		content: value,
		onUpdate: ({editor}) => patchProps({ text: editor.getHTML() }),
		onSelectionUpdate: () => {
			setIsFocused(prev => !prev);
		},
	})

	return (
		<RichTextEditor editor={editor}>
			<RichTextEditor.Toolbar sticky stickyOffset={60}>
				<RichTextEditor.ControlsGroup>
					<RichTextEditor.Bold/>
					<RichTextEditor.Italic/>
					<RichTextEditor.Underline/>
					<RichTextEditor.Strikethrough/>
					<RichTextEditor.ClearFormatting/>
					<RichTextEditor.Highlight/>
				</RichTextEditor.ControlsGroup>

				<RichTextEditor.ControlsGroup>
					<RichTextEditor.H1/>
					<RichTextEditor.H2/>
					<RichTextEditor.H3/>
					<RichTextEditor.H4/>
					<RichTextEditor.H5/>
					<RichTextEditor.H6/>
				</RichTextEditor.ControlsGroup>

				<RichTextEditor.ControlsGroup>
					<RichTextEditor.Blockquote/>
					<RichTextEditor.Hr/>
					<RichTextEditor.BulletList/>
					<RichTextEditor.OrderedList/>
					<RichTextEditor.Subscript/>
					<RichTextEditor.Superscript/>
				</RichTextEditor.ControlsGroup>

				<RichTextEditor.ControlsGroup>
					<RichTextEditor.Link/>
					<RichTextEditor.Unlink/>
				</RichTextEditor.ControlsGroup>

				<RichTextEditor.ControlsGroup>
					<RichTextEditor.AlignLeft/>
					<RichTextEditor.AlignCenter/>
					<RichTextEditor.AlignJustify/>
					<RichTextEditor.AlignRight/>
				</RichTextEditor.ControlsGroup>

				<RichTextEditor.ControlsGroup>
					<RichTextEditor.Undo/>
					<RichTextEditor.Redo/>
				</RichTextEditor.ControlsGroup>
			</RichTextEditor.Toolbar>

			<RichTextEditor.Content/>
		</RichTextEditor>
	)
}