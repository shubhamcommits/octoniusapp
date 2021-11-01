// Quill Import
import Quill from 'quill';
import { ListItem } from 'quill-delta-to-html/dist/commonjs/grouper/group-types';
import List, { ListContainer } from 'quill/formats/list';

class MyListContainer extends ListContainer {

  domNode;
  next;

	static tagName = ["OL", "UL"];
	static defaultTag = "OL";

	static create(value) {
		return document.createElement(this.getTag(value));
	}

	static getTag(val) {
                // Our "ql-list" values are "bullet" and "ordered"
		const map = {
			bullet: "UL",
			ordered: "OL",
		};
		return map[val] || this.defaultTag;
	}

	checkMerge() {
		// Only merge if the next list is the same type as this one
		return (
			super.checkMerge() &&
			this.domNode.tagName === this.next.domNode.tagName
		);
	}
}

class MyListItem extends ListItem {

  statics;
  parent;
  domNode;

	static requiredContainer = MyListContainer;

	static register() {
		Quill.register(MyListContainer, true);
	}

	optimize(context) {
		if (
			this.statics.requiredContainer &&
			!(this.parent instanceof this.statics.requiredContainer)
		) {
                        // Insert the format value (bullet, ordered) into wrap arguments
			this.wrap(
				this.statics.requiredContainer.blotName,
				MyListItem.formats(this.domNode)
			);
		}
		super.optimize(context);
	}

	format(name, value) {
                // If the list type is different, wrap this list item in a new MyListContainer of that type
		if (
			name === ListItem.blotName &&
			value !== MyListItem.formats(this.domNode)
		) {
			this.wrap(this.statics.requiredContainer.blotName, value);
		}
		super.format(name, value);
	}
}
