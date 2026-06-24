<script setup lang="ts">
import { ref, watch, inject, type Ref, nextTick, computed } from "vue"
import { useEditor, EditorContent } from "@tiptap/vue-3"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import CodeExtension from "@tiptap/extension-code"
import Link from "@tiptap/extension-link"
import {
    TextBold, TextItalic, TextCross, LinkMinimalistic,
    ListCheck, ListArrowDown, ChatRoundLine, Code,
    UndoLeftRound, UndoRightRound, AltArrowDown, Eraser,
    Settings
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
import type { Selection } from "@tiptap/pm/state"
import { useEditorSettingsStore } from "@/utils/stores/editor"
import EditDialog from "../blocks/editDialog.vue"

const settingsStore = useEditorSettingsStore()

const dynamicEditorStyles = computed(() => ({
    "--editor-font-family": settingsStore.fontFamilyName,
    "--editor-font-size": `${settingsStore.fontSize}px`,
    "--editor-line-height": `${settingsStore.lineHeight}`,
    "--editor-content-width": `${settingsStore.contentWidth}%`,
    "--editor-first-line-indent": `${settingsStore.paragraphSpacing}px`,
    "--editor-letter-spacing": `${settingsStore.letterSpacing}px`,
    "--editor-paragraph-block": `${settingsStore.paragraphBlock}px`
}))
const headerHeight = inject<Ref<number>>(
    "headerHeight",
    ref(0)
)

const props = withDefaults(
    defineProps<{
        modelValue: string
        placeholder?: string
    }>(),
    { placeholder: "What's new today?" }
)

const emit = defineEmits<{ "update:modelValue": [value: string] }>()
const editorState = inject<Ref<EditorState>>("editorState", ref("closed"))
const savedSelection = ref<Selection | null>(null)

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
        Placeholder.configure({
            placeholder: props.placeholder,
            emptyEditorClass: "is-editor-empty",
            emptyNodeClass: "is-empty",
            showOnlyCurrent: false,
        })
    ],
    editorProps: {
        attributes: { class: "prose-entry focus:outline-none" },
        scrollMargin: { top: 16, bottom: 120, left: 0, right: 0 },
        scrollThreshold: { top: 16, bottom: 65, left: 0, right: 0 },
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


async function setHeading(level: number | null) {
    if (!editor.value) return

    const chain = editor.value.chain()

    if (savedSelection.value) {
        chain.setTextSelection(savedSelection.value)
    }

    chain.focus()

    if (level === null) {
        chain.setParagraph()
    } else {
        chain.toggleHeading({
            level: level as 1 | 2 | 3 | 4,
        })
    }

    chain.run()

    await nextTick()

    editor.value.commands.focus()

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



function saveSelection() {
    if (!editor.value) return
    savedSelection.value = editor.value.state.selection
}

watch(
    () => props.modelValue,
    (value) => {
        if (value === editor.value?.getHTML()) return
        editor.value?.commands.setContent(value, { emitUpdate: false })
    }
)

function restoreEditorFocus() {
    const instance = editor.value

    if (!instance) return

    requestAnimationFrame(() => {
        const chain = instance.chain()

        if (savedSelection.value) {
            chain.setTextSelection(savedSelection.value)
        }

        chain.focus()
        chain.run()

        instance.view.dom.focus()
    })
}

defineExpose({ editor })
</script>

<template>
    <div class="flex flex-col transition-all duration-300" :class="[
        editorState !== 'closed'
            ? 'fixed left-0 right-0 bottom-0 z-40 bg-background'
            : 'h-full cursor-text'
    ]" :style="[
        dynamicEditorStyles,
        editorState !== 'closed'
            ? {
                top: 'var(--tg-safe-area-inset-top, 0px)',
            }
            : {}
    ]" @click="editorState === 'closed' && (editorState = 'open')">
        <EditorContent :editor="editor" class="flex-1 overflow-y-auto px-4 pb-32 scroll-pb-32 text-sm leading-relaxed"
            @click.stop :style="{
                paddingTop: `${headerHeight + 16}px`
            }" />
    </div>

    <Teleport to="#dock-toolbar-slot" v-if="editor && editorState === 'focused'">
        <Button type="button" size="icon-lg" class="rounded-md shrink-0" variant="ghost" aria-label="Отменить"
            :disabled="!editor.can().undo()" @click="editor.chain().focus().undo().run()">
            <UndoLeftRound weight="Bold" class="size-5" />
        </Button>
        <Button type="button" size="icon-lg" class="rounded-md shrink-0" variant="ghost" aria-label="Повторить"
            :disabled="!editor.can().redo()" @click="editor.chain().focus().redo().run()">
            <UndoRightRound weight="Bold" class="size-5" />
        </Button>

        <div class="w-px h-6 bg-border mx-1 shrink-0"></div>

        <Button type="button" size="icon-lg" class="rounded-md shrink-0"
            :variant="editor.isActive('bold') ? 'secondary' : 'ghost'" aria-label="Жирный"
            @click="editor.chain().focus().toggleBold().run()">
            <TextBold weight="Bold" class="size-5" />
        </Button>
        <Button type="button" size="icon-lg" class="rounded-md shrink-0"
            :variant="editor.isActive('italic') ? 'secondary' : 'ghost'" aria-label="Курсив"
            @click="editor.chain().focus().toggleItalic().run()">
            <TextItalic weight="Bold" class="size-5" />
        </Button>
        <Button type="button" size="icon-lg" class="rounded-md shrink-0"
            :variant="editor.isActive('strike') ? 'secondary' : 'ghost'" aria-label="Зачеркнутый"
            @click="editor.chain().focus().toggleStrike().run()">
            <TextCross weight="Bold" class="size-5" />
        </Button>

        <Dialog v-model:open="linkDialogOpen">
            <DialogTrigger as-child>
                <Button type="button" size="icon-lg" class="rounded-md shrink-0"
                    :variant="editor.isActive('link') ? 'secondary' : 'ghost'" aria-label="Ссылка"
                    @click="openLinkDialog" @pointerdown="saveSelection">
                    <LinkMinimalistic weight="Bold" class="size-5" />
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
            <DropdownMenuContent align="start" class="w-32" @close-auto-focus.prevent="restoreEditorFocus">
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
            <Eraser weight="Bold" class="size-5" />
        </Button>


        <div class="w-px h-6 bg-border mx-1 shrink-0"></div>

        <Button type="button" size="icon-lg" class="rounded-md shrink-0"
            :variant="editor.isActive('bulletList') ? 'secondary' : 'ghost'" aria-label="Маркированный список"
            @click="editor.chain().focus().toggleBulletList().run()">
            <ListCheck weight="Bold" class="size-5" />
        </Button>
        <Button type="button" size="icon-lg" class="rounded-md shrink-0"
            :variant="editor.isActive('orderedList') ? 'secondary' : 'ghost'" aria-label="Нумерованный список"
            @click="editor.chain().focus().toggleOrderedList().run()">
            <ListArrowDown weight="Bold" class="size-5" />
        </Button>
        <Button type="button" size="icon-lg" class="rounded-md shrink-0"
            :variant="editor.isActive('blockquote') ? 'secondary' : 'ghost'" aria-label="Цитата"
            @click="editor.chain().focus().toggleBlockquote().run()">
            <ChatRoundLine weight="Bold" class="size-5" />
        </Button>
        <Button type="button" size="icon-lg" class="rounded-md shrink-0"
            :variant="editor.isActive('code') ? 'secondary' : 'ghost'" aria-label="Код"
            @click="editor.chain().focus().toggleCode().run()">
            <Code weight="Bold" class="size-5" />
        </Button>

        <div class="w-px h-6 bg-border mx-1 shrink-0"></div>

        <EditDialog>
            <Button type="button" size="icon-lg" class="rounded-md shrink-0"
                :variant="editor.isActive('code') ? 'secondary' : 'ghost'" aria-label="Настройки">
                <Settings weight="Bold" class="size-5" />
            </Button>
        </EditDialog>

    </Teleport>
</template>

<style>
.prose-entry {
    font-family: var(--editor-font-family);
    font-size: var(--editor-font-size);
    line-height: var(--editor-line-height);
    letter-spacing: var(--editor-letter-spacing);

    width: var(--editor-content-width);
    max-width: 100%;
    margin-inline: auto;
}

.prose-entry p {
    position: relative;
    /* Контекст для абсолютного плейсхолдера */
    line-height: var(--editor-line-height);
    /* text-indent теперь ВСЕГДА активен, чтобы курсор не прыгал при вводе */
    text-indent: var(--editor-first-line-indent);
    margin-block: var(--editor-paragraph-block);
}

/* Предотвращаем схлопывание высоты пустых параграфов (убирает прыжки отступов сверху) */
.prose-entry p:empty::after {
    content: "\200B";
    /* Zero-width space */
    display: inline-block;
    height: 0;
}

.prose-entry p:first-child {
    margin-top: 0;
}

.prose-entry h1:first-child,
.prose-entry h2:first-child,
.prose-entry h3:first-child,
.prose-entry h4:first-child {
    margin-top: 0;
}

.prose-entry h1,
.prose-entry h2,
.prose-entry h3,
.prose-entry h4 {
    font-weight: 700;
    line-height: 1.25;
    margin-top: 0.3em;
    margin-bottom: 0.1em;
}

.prose-entry h1 {
    font-size: 2.25em;
}

.prose-entry h2 {
    font-size: 1.75em;
}

.prose-entry h3 {
    font-size: 1.35em;
}

.prose-entry h4 {
    font-size: 1.15em;
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
    text-indent: 0 !important;
}

.prose-entry blockquote p {
    text-indent: 0;
}

.prose-entry blockquote {
    border-left: 4px solid var(--border);
    padding-inline-start: 1rem;
    margin-block: 1em;
    color: var(--muted-foreground);
    font-style: italic;
}

.prose-entry code {
    background-color: var(--muted);
    border-radius: 0.25rem;
    padding: 0.2em 0.4em;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.85em;
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

.prose-entry li>p.is-empty::before,
.prose-entry blockquote p.is-empty::before {
    left: 0 !important;
}

.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>