<script setup lang="ts">
import { ref, watch, inject, type Ref, nextTick } from "vue"
import { useEditor, EditorContent } from "@tiptap/vue-3"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import CodeExtension from "@tiptap/extension-code"
import Link from "@tiptap/extension-link"
import {
    TextBold, TextItalic, TextCross, LinkMinimalistic,
    ListCheck, ListArrowDown, ChatRoundLine, Code,
    UndoLeftRound, UndoRightRound, AltArrowDown, Eraser
} from "@solar-icons/vue"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter,
    DialogClose, DialogTrigger,
    DialogDescription
} from "@/components/ui/dialog"
import type { EditorState } from "@/types/editor"

const headerHeight = inject<Ref<number>>(
    "headerHeight",
    ref(0)
)

const props = withDefaults(
    defineProps<{
        modelValue: string
        placeholder?: string
    }>(),
    { placeholder: "Что произошло сегодня?" }
)

const emit = defineEmits<{ "update:modelValue": [value: string] }>()
const editorState = inject<Ref<EditorState>>("editorState", ref("closed"))

const activeHeading = ref<string | null>("Normal")
const linkDialogOpen = ref(false)
const linkUrl = ref("")


function syncActiveMarks() {
    if (!editor.value) return
    const level = [1, 2, 3, 4].find((l) => editor.value?.isActive("heading", { level: l }))
    activeHeading.value = level ? `H${level}` : "Normal"
}

const editor = useEditor({
    content: props.modelValue,
    extensions: [
        StarterKit.configure({
            heading: { levels: [1, 2, 3, 4] },
        }),
        CodeExtension,
        Link.configure({
            openOnClick: false,
            HTMLAttributes: { class: "text-primary underline cursor-pointer" },
        }),
        Placeholder.configure({ placeholder: props.placeholder }),
    ],
    editorProps: {
        attributes: { class: "prose-entry focus:outline-none" },
    },
    onUpdate: ({ editor }) => {
        emit("update:modelValue", editor.getHTML())
        syncActiveMarks()
    },
    onSelectionUpdate: syncActiveMarks,
    onTransaction: syncActiveMarks,
    onFocus: () => {
        editorState.value = "focused"
    },
})

watch(editorState, async (state) => {
    if (!editor.value) return
    await nextTick()

    if (state === "focused") {
        editor.value.commands.focus("end")
        syncActiveMarks()
    } else {
        editor.value.commands.blur()
    }
}, { flush: "post" })

function setHeading(level: number | null) {
    if (!editor.value) return
    if (!level) {
        editor.value.chain().focus().setParagraph().run()
    } else {
        editor.value.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 }).run()
    }
    syncActiveMarks()
}


function openLinkDialog() {
    if (!editor.value) return
    const currentUrl = editor.value.getAttributes("link").href || ""
    linkUrl.value = currentUrl
    linkDialogOpen.value = true
}

function applyLink() {
    if (!editor.value) return

    if (!linkUrl.value.trim()) {
        editor.value.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
        let url = linkUrl.value.trim()
        if (!/^https?:\/\//i.test(url)) {
            url = 'https://' + url
        }
        editor.value.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    }
    linkDialogOpen.value = false
}

function clearFormatting() {
    if (!editor.value) return

    editor.value
        .chain()
        .focus()
        .clearNodes()
        .unsetAllMarks()
        .run()

    syncActiveMarks()
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
    <div class="flex flex-col transition-all duration-300" :class="[
        editorState !== 'closed'
            ? 'fixed left-0 right-0 bottom-0 z-40 bg-background'
            : 'h-full cursor-text'
    ]" :style="editorState !== 'closed'
        ? {
            top: `calc(${headerHeight}px + var(--tg-safe-area-inset-top, 0px) + 1rem)`
        }
        : undefined
        " @click="editorState === 'closed' && (editorState = 'open')">
        <EditorContent :editor="editor" class="flex-1 overflow-y-auto px-4 pb-24 text-sm leading-relaxed" @click.stop />
    </div>

    <Teleport to="#dock-toolbar-slot" v-if="editor && editorState === 'focused'">
        <Button type="button" size="icon-sm" class="rounded-md shrink-0" variant="ghost" aria-label="Отменить"
            :disabled="!editor.can().undo()" @click="editor.chain().focus().undo().run()">
            <UndoLeftRound weight="Bold" class="size-4" />
        </Button>
        <Button type="button" size="icon-sm" class="rounded-md shrink-0" variant="ghost" aria-label="Повторить"
            :disabled="!editor.can().redo()" @click="editor.chain().focus().redo().run()">
            <UndoRightRound weight="Bold" class="size-4" />
        </Button>

        <div class="w-px h-6 bg-border mx-1 shrink-0"></div>

        <Button type="button" size="icon-sm" class="rounded-md shrink-0"
            :variant="editor.isActive('bold') ? 'secondary' : 'ghost'" aria-label="Жирный"
            @click="editor.chain().focus().toggleBold().run()">
            <TextBold weight="Bold" class="size-4" />
        </Button>
        <Button type="button" size="icon-sm" class="rounded-md shrink-0"
            :variant="editor.isActive('italic') ? 'secondary' : 'ghost'" aria-label="Курсив"
            @click="editor.chain().focus().toggleItalic().run()">
            <TextItalic weight="Bold" class="size-4" />
        </Button>
        <Button type="button" size="icon-sm" class="rounded-md shrink-0"
            :variant="editor.isActive('strike') ? 'secondary' : 'ghost'" aria-label="Зачеркнутый"
            @click="editor.chain().focus().toggleStrike().run()">
            <TextCross weight="Bold" class="size-4" />
        </Button>

        <Dialog v-model:open="linkDialogOpen">
            <DialogTrigger as-child>
                <Button type="button" size="icon-sm" class="rounded-md shrink-0"
                    :variant="editor.isActive('link') ? 'secondary' : 'ghost'" aria-label="Ссылка"
                    @click="openLinkDialog">
                    <LinkMinimalistic weight="Bold" class="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent class="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Insert link</DialogTitle>
                    <DialogDescription>
                        insert link to any site for save it
                    </DialogDescription>
                </DialogHeader>
                <Label for="link" class="sr-only">
                    Link
                </Label>
                <Input id="link" v-model="linkUrl" default-value="https://example.com" />

                <DialogFooter>
                    <DialogClose as-child>
                        <Button type="button" variant="outline">Отмена</Button>
                    </DialogClose>
                    <Button type="button" @click="applyLink">
                        {{ editor.isActive('link') ? 'Обновить' : 'Добавить' }}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <div class="w-px h-6 bg-border mx-1 shrink-0"></div>

        <DropdownMenu>
            <DropdownMenuTrigger as-child>
                <Button type="button" size="sm" class="rounded-md shrink-0 gap-1 h-8 px-2" variant="ghost">
                    <span class="text-xs font-medium">{{ activeHeading }}</span>
                    <AltArrowDown weight="Bold" class="size-3" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" class="w-32">
                <DropdownMenuItem @click="setHeading(null)" :class="{ 'bg-secondary': activeHeading === 'Normal' }">
                    Normal
                </DropdownMenuItem>
                <DropdownMenuItem v-for="i in 4" :key="i" @click="setHeading(i)"
                    :class="{ 'bg-secondary': activeHeading === `H${i}` }">
                    H{{ i }}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

        <Button type="button" size="icon-sm" class="rounded-md shrink-0" variant="ghost"
            aria-label="Очистить форматирование" @click="clearFormatting">
            <Eraser weight="Bold" class="size-4" />
        </Button>


        <div class="w-px h-6 bg-border mx-1 shrink-0"></div>

        <Button type="button" size="icon-sm" class="rounded-md shrink-0"
            :variant="editor.isActive('bulletList') ? 'secondary' : 'ghost'" aria-label="Маркированный список"
            @click="editor.chain().focus().toggleBulletList().run()">
            <ListCheck weight="Bold" class="size-4" />
        </Button>
        <Button type="button" size="icon-sm" class="rounded-md shrink-0"
            :variant="editor.isActive('orderedList') ? 'secondary' : 'ghost'" aria-label="Нумерованный список"
            @click="editor.chain().focus().toggleOrderedList().run()">
            <ListArrowDown weight="Bold" class="size-4" />
        </Button>
        <Button type="button" size="icon-sm" class="rounded-md shrink-0"
            :variant="editor.isActive('blockquote') ? 'secondary' : 'ghost'" aria-label="Цитата"
            @click="editor.chain().focus().toggleBlockquote().run()">
            <ChatRoundLine weight="Bold" class="size-4" />
        </Button>
        <Button type="button" size="icon-sm" class="rounded-md shrink-0"
            :variant="editor.isActive('code') ? 'secondary' : 'ghost'" aria-label="Код"
            @click="editor.chain().focus().toggleCode().run()">
            <Code weight="Bold" class="size-4" />
        </Button>

    </Teleport>
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

.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>