<script setup lang="ts">
import { ref, watch } from "vue"
import { useEditor, EditorContent } from "@tiptap/vue-3"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import CodeExtension from "@tiptap/extension-code"
import { TextBold, TextItalic, ListCheck, ListArrowDown, ChatRoundLine, Code, CodeSquare } from "@solar-icons/vue"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useIsMobile } from "@/utils/hooks/useMobile"

const props = withDefaults(
    defineProps<{
        modelValue: string
        placeholder?: string
    }>(),
    { placeholder: "Что произошло сегодня?" }
)

const emit = defineEmits<{ "update:modelValue": [value: string] }>()
const isMobile = useIsMobile()

const activeMarks = ref<string[]>([])
const activeHeading = ref<string | null>(null)

function syncActiveMarks() {
    if (!editor.value) return

    const marks: string[] = []
    if (editor.value.isActive("bold")) marks.push("bold")
    if (editor.value.isActive("italic")) marks.push("italic")
    if (editor.value.isActive("code")) marks.push("code")
    activeMarks.value = marks

    const level = [1, 2, 3, 4].find((level) => editor.value?.isActive("heading", { level }))
    activeHeading.value = level ? String(level) : null
}

const editor = useEditor({
    content: props.modelValue,
    extensions: [
        StarterKit.configure({ heading: { levels: [1, 2, 3, 4] }, code: false }),
        CodeExtension,
        Placeholder.configure({ placeholder: props.placeholder }),
    ],
    editorProps: {
        attributes: {
            class: "prose-entry focus:outline-none",
        },
    },
    onUpdate: ({ editor }) => {
        emit("update:modelValue", editor.getHTML())
        syncActiveMarks()
    },
    onSelectionUpdate: syncActiveMarks,
    onTransaction: syncActiveMarks,
})

function onMarksChange(next: string[]) {
    if (!editor.value) return

    const chain = editor.value.chain().focus()
    if (next.includes("bold") !== activeMarks.value.includes("bold")) chain.toggleBold()
    if (next.includes("italic") !== activeMarks.value.includes("italic")) chain.toggleItalic()
    if (next.includes("code") !== activeMarks.value.includes("code")) chain.toggleCode()
    chain.run()
}

function onHeadingChange(level: string | undefined) {
    if (!editor.value) return

    if (!level) {
        editor.value.chain().focus().setParagraph().run()
        return
    }

    editor.value.chain().focus().toggleHeading({ level: Number(level) as 1 | 2 | 3 | 4 }).run()
}

watch(
    () => props.modelValue,
    (value) => {
        if (value === editor.value?.getHTML()) return
        editor.value?.commands.setContent(value, { emitUpdate: false })
    }
)

defineExpose({ editor })
</script>

<template>
    <div class="flex flex-col h-full">
        <EditorContent :editor="editor" class="flex-1 overflow-y-auto px-4 pb-24 text-sm leading-relaxed" />

        <div v-if="editor"
            class="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border p-2 flex items-center gap-1.5"
            :style="{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }">

            <ToggleGroup type="single" :model-value="activeHeading ?? undefined" size="sm" class="rounded-md"
                @update:model-value="onHeadingChange">
                <ToggleGroupItem value="1" aria-label="Заголовок 1" class="rounded-md">H1</ToggleGroupItem>
                <ToggleGroupItem value="2" aria-label="Заголовок 2" class="rounded-md">H2</ToggleGroupItem>
                <ToggleGroupItem value="3" aria-label="Заголовок 3" class="rounded-md">H3</ToggleGroupItem>
                <ToggleGroupItem value="4" aria-label="Заголовок 4" class="rounded-md">H4</ToggleGroupItem>
            </ToggleGroup>

            <ToggleGroup type="multiple" :model-value="activeMarks" size="sm" class="rounded-md"
                @update:model-value="onMarksChange">
                <ToggleGroupItem value="bold" aria-label="Жирный" class="rounded-md">
                    <TextBold weight="Bold" class="size-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="italic" aria-label="Курсив" class="rounded-md">
                    <TextItalic weight="Bold" class="size-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="code" aria-label="Код" class="rounded-md">
                    <Code weight="Bold" class="size-4" />
                </ToggleGroupItem>
            </ToggleGroup>

            <Button type="button" size="icon-sm" class="rounded-md"
                :variant="editor.isActive('bulletList') ? 'secondary' : 'ghost'" aria-label="Маркированный список"
                @click="editor.chain().focus().toggleBulletList().run()">
                <ListCheck weight="Bold" class="size-4" />
            </Button>

            <Button type="button" size="icon-sm" class="rounded-md"
                :variant="editor.isActive('orderedList') ? 'secondary' : 'ghost'" aria-label="Нумерованный список"
                @click="editor.chain().focus().toggleOrderedList().run()">
                <ListArrowDown weight="Bold" class="size-4" />
            </Button>

            <Button type="button" size="icon-sm" class="rounded-md"
                :variant="editor.isActive('blockquote') ? 'secondary' : 'ghost'" aria-label="Цитата"
                @click="editor.chain().focus().toggleBlockquote().run()">
                <ChatRoundLine weight="Bold" class="size-4" />
            </Button>

            <Button type="button" size="icon-sm" class="rounded-md"
                :variant="editor.isActive('codeBlock') ? 'secondary' : 'ghost'" aria-label="Блок кода"
                @click="editor.chain().focus().toggleCodeBlock().run()">
                <CodeSquare weight="Bold" class="size-4" />
            </Button>
        </div>
    </div>
</template>

<style>
.prose-entry p {
    line-height: 1.7;
    margin-block: 0.4em;
}

.prose-entry p:first-child {
    margin-top: 0;
}

.prose-entry h1 {
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1.25;
    margin-block: 0.6em 0.3em;
}

.prose-entry h1:first-child {
    margin-top: 0;
}

.prose-entry h2 {
    font-size: 1.25rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    line-height: 1.3;
    margin-block: 0.6em 0.3em;
}

.prose-entry h2:first-child {
    margin-top: 0;
}

.prose-entry h3 {
    font-size: 1.1rem;
    font-weight: 600;
    line-height: 1.35;
    margin-block: 0.5em 0.25em;
}

.prose-entry h3:first-child {
    margin-top: 0;
}

.prose-entry h4 {
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.4;
    margin-block: 0.4em 0.2em;
}

.prose-entry h4:first-child {
    margin-top: 0;
}

.prose-entry ul {
    list-style-type: disc;
    padding-inline-start: 1.4rem;
    margin-block: 0.4em;
}

.prose-entry ol {
    list-style-type: decimal;
    padding-inline-start: 1.4rem;
    margin-block: 0.4em;
}

.prose-entry li {
    margin-block: 0.15em;
}

.prose-entry li>p {
    margin: 0;
}

.prose-entry blockquote {
    border-left: 3px solid var(--border);
    padding-inline-start: 0.9rem;
    margin-block: 0.5em;
    color: var(--muted-foreground);
    font-style: italic;
}

.prose-entry code {
    background-color: var(--muted);
    border-radius: 0.25rem;
    padding: 0.15em 0.4em;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.85em;
    font-weight: 600;
}

.prose-entry pre {
    background-color: var(--muted);
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;
    margin-block: 0.5em;
    overflow-x: auto;
}

.prose-entry pre code {
    background-color: transparent;
    padding: 0;
    font-weight: 400;
    font-size: 0.85em;
    line-height: 1.5;
}

.prose-entry hr {
    border: none;
    border-top: 1px solid var(--border);
    margin-block: 1em;
}

.prose-entry strong {
    font-weight: 700;
}

.prose-entry em {
    font-style: italic;
}

.prose-entry p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    color: var(--muted-foreground);
    float: left;
    pointer-events: none;
    height: 0;
}

.flex-wrap .toggle-group-item,
.flex-wrap button {
    border-radius: var(--radius) !important;
    min-width: 2rem !important;
}

.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>