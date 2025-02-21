import {
  Decoration,
  DecorationSet,
  EditorView,
  Range,
  syntaxTree,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "../deps.ts";
import { invisibleDecoration, isCursorInRange } from "./util.ts";

class InlineImageWidget extends WidgetType {
  constructor(readonly url: string, readonly title: string) {
    super();
  }

  eq(other: InlineImageWidget) {
    return other.url === this.url && other.title === this.title;
  }

  toDOM() {
    const img = document.createElement("img");
    if (this.url.startsWith("http")) {
      img.src = this.url;
    } else {
      img.src = `fs/${this.url}`;
    }
    img.alt = this.title;
    img.title = this.title;
    img.style.display = "block";
    img.className = "sb-inline-img";

    return img;
  }
}

const inlineImages = (view: EditorView) => {
  const widgets: Range<Decoration>[] = [];
  const imageRegex = /!\[(?<title>[^\]]*)\]\((?<url>.+)\)/;

  for (const { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter: (node) => {
        if (node.name !== "Image") {
          return;
        }

        const imageRexexResult = imageRegex.exec(
          view.state.sliceDoc(node.from, node.to),
        );
        if (imageRexexResult === null || !imageRexexResult.groups) {
          return;
        }

        const url = imageRexexResult.groups.url;
        const title = imageRexexResult.groups.title;
        widgets.push(
          Decoration.widget({
            widget: new InlineImageWidget(url, title),
          }).range(node.to),
        );
      },
    });
  }

  return Decoration.set(widgets, true);
};

export const inlineImagesPlugin = () =>
  ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = inlineImages(view);
      }

      update(update: ViewUpdate) {
        if (update.docChanged) {
          this.decorations = inlineImages(update.view);
        }
      }
    },
    {
      decorations: (v) => v.decorations,
    },
  );
