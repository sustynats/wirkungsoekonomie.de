// Small DOM fixture for the existing vanilla handlers. This is not a browser or
// a layout/accessibility engine: viewport and assistive-technology QA stays separate.
const decode = value => value.replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, c => ({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#39;':"'",'&nbsp;':' '}[c]));
const voidTags = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
export class Element {
  constructor(tag = 'div', attributes = {}, document = null) {
    this.tagName = tag.toUpperCase(); this.attributes = attributes; this.ownerDocument = document;
    this.children = []; this.nodes = []; this.listeners = {}; this.dataset = {};
    for (const [key, value] of Object.entries(attributes)) if (key.startsWith('data-')) this.dataset[key.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
    this.hidden = 'hidden' in attributes; this.checked = 'checked' in attributes;
    this.classList = {toggle: (name, yes) => { this.classes ||= new Set(); if (yes) this.classes.add(name); else this.classes.delete(name); }, contains: name => this.classes?.has(name) || false};
  }
  get name() { return this.attributes.name; }
  get type() { return this.attributes.type || ''; }
  get value() { return this._value ?? this.attributes.value ?? (this.tagName === 'SELECT' ? this.children.find(c => c.tagName === 'OPTION')?.value || '' : ''); }
  set value(value) { this._value = String(value); }
  get textContent() { return this.nodes.map(n => typeof n === 'string' ? n : n.textContent).join(''); }
  set textContent(value) { this.nodes = [String(value)]; this.children = []; }
  get innerHTML() { return this._html || this.textContent; }
  set innerHTML(value) {
    this._html = String(value); this.nodes = []; this.children = []; this._value = undefined;
    parseInto(this, value, this.ownerDocument);
  }
  matches(selector) {
    const tag = selector.match(/^[a-z][\w-]*/i)?.[0];
    if (tag && this.tagName.toLowerCase() !== tag.toLowerCase()) return false;
    const id = selector.match(/#([\w-]+)/)?.[1];
    if (id && this.attributes.id !== id) return false;
    for (const [, key, value] of selector.matchAll(/\[([\w-]+)(?:=['"]?([^'"\]]+)['"]?)?\]/g)) {
      if (!(key in this.attributes) || (value !== undefined && this.attributes[key] !== value)) return false;
    }
    return !!(tag || id || selector.startsWith('['));
  }
  querySelectorAll(selector) {
    const result = [];
    const visit = node => { for (const c of node.children) { if (c.matches(selector)) result.push(c); visit(c); } };
    visit(this); return result;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  closest(selector) { return this.matches(selector) ? this : this.parentElement?.closest(selector) || null; }
  addEventListener(type, callback) { (this.listeners[type] ||= []).push(callback); }
  dispatch(type, event = {}) {
    event.target ||= this; event.preventDefault ||= () => { event.defaultPrevented = true; };
    for (const callback of this.listeners[type] || []) callback(event);
    this.parentElement?.dispatch(type, event); return event;
  }
  focus() { if (this.ownerDocument) this.ownerDocument.activeElement = this; }
}
export class Input extends Element {}
export class Select extends Element {}
export class Button extends Element {}
function parseInto(root, source, document) {
  let parent = root;
  const clean = source.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
  for (const token of clean.matchAll(/<[^>]+>|[^<]+/g)) {
    const text = token[0];
    if (text.startsWith('</')) { if (parent !== root) parent = parent.parentElement; continue; }
    if (!text.startsWith('<')) { parent.nodes.push(decode(text)); continue; }
    const tag = text.match(/^<([a-z][\w-]*)/i)?.[1]?.toLowerCase(); if (!tag) continue;
    const attrs = {};
    const tail = text.slice(tag.length + 1, -1);
    for (const [, key, double, single, unquoted] of tail.matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) attrs[key] = decode(double ?? single ?? unquoted ?? '');
    const Class = tag === 'input' ? Input : tag === 'select' ? Select : tag === 'button' ? Button : Element;
    const node = new Class(tag, attrs, document); node.parentElement = parent; parent.children.push(node); parent.nodes.push(node);
    if (!voidTags.has(tag) && !text.endsWith('/>')) parent = node;
  }
}
export function dom(source) {
  const document = new Element('document'); document.ownerDocument = document;
  parseInto(document, source, document);
  return document;
}
export const constructors = {HTMLElement: Element, HTMLInputElement: Input, HTMLSelectElement: Select, HTMLButtonElement: Button};
