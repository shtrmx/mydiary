<script setup lang="ts">
import { watch } from "vue"
import { useEditor, EditorContent } from "@tiptap/vue-3"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import {
    TextBold,
    TextItalic,
    ListCheck,
    ListArrowDown,
    ChatRoundLine,
} from "@solar-icons/vue"

const props = withDefaults(
    defineProps<{
        modelValue: string
        placeholder?: string
    }>(),
    { placeholder: "Что произошло сегодня?" }
)

const emit = defineEmits<{ "update:modelValue": [value: string] }>()

const editor = useEditor({
    content: props.modelValue,
    extensions: [
        StarterKit.configure({ heading: { levels: [2, 3] } }),
        Placeholder.configure({ placeholder: props.placeholder }),
    ],
    editorProps: {
        attributes: {
            // Класс 'prose' берет на себя всю магию стилей h2, blockquote и т.д.
            // 'prose-sm' задает компактный размер для мобильного интерфейса
            class: "prose prose-sm dark:prose-invert focus:outline-none max-w-none",
        },
    },
    onUpdate: ({ editor }) => {
        emit("update:modelValue", editor.getHTML())
    },
})

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
    <div class="flex flex-col gap-3">
        <div v-if="editor" class="flex items-center gap-1 border-b border-border pb-2">
            <button type="button" class="rounded-lg p-2 transition-colors"
                :class="editor.isActive('bold') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'"
                @click="editor.chain().focus().toggleBold().run()">
                <TextBold weight="Bold" class="size-4" />
            </button>

            <button type="button" class="rounded-lg p-2 transition-colors"
                :class="editor.isActive('italic') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'"
                @click="editor.chain().focus().toggleItalic().run()">
                <TextItalic weight="Bold" class="size-4" />
            </button>

            <span class="mx-1 h-4 w-px bg-border" />

            <button type="button" class="rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors"
                :class="editor.isActive('heading', { level: 2 }) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'"
                @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">
                H2
            </button>

            <button type="button" class="rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors"
                :class="editor.isActive('heading', { level: 3 }) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'"
                @click="editor.chain().focus().toggleHeading({ level: 3 }).run()">
                H3
            </button>

            <span class="mx-1 h-4 w-px bg-border" />

            <button type="button" class="rounded-lg p-2 transition-colors"
                :class="editor.isActive('bulletList') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'"
                @click="editor.chain().focus().toggleBulletList().run()">
                <ListCheck weight="Bold" class="size-4" />
            </button>

            <button type="button" class="rounded-lg p-2 transition-colors"
                :class="editor.isActive('orderedList') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'"
                @click="editor.chain().focus().toggleOrderedList().run()">
                <ListArrowDown weight="Bold" class="size-4" />
            </button>

            <button type="button" class="rounded-lg p-2 transition-colors"
                :class="editor.isActive('blockquote') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'"
                @click="editor.chain().focus().toggleBlockquote().run()">
                <ChatRoundLine weight="Bold" class="size-4" />
            </button>
        </div>

        <div class="min-h-32">
            <EditorContent :editor="editor" />
        </div>
    </div>
</template>

<style scoped>
/* Стиль для плейсхолдера, если используешь расширение Placeholder */
:deep(.is-editor-empty:first-child::before) {
    content: attr(data-placeholder);
    color: var(--muted-foreground);
    float: left;
    pointer-events: none;
}
</style>