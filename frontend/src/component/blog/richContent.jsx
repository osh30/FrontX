import React, { Fragment } from 'react';
import { getSchema, generateHTML } from '@tiptap/core';
import { StarterKit } from '@tiptap/starter-kit';
import { TableKit } from '@tiptap/extension-table';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extension-placeholder';
import DOMPurify from 'dompurify';
import SectionRenderer from './SectionRenderer';
import { slugify } from './blogConfig';

export const RichImage = Image.extend({
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      caption: { default: '' }
    };
  }
});

export const buildExtensions = () => [
  StarterKit.configure({ link: false, heading: { levels: [1, 2, 3, 4] } }),
  TextStyle,
  Color,
  Link.configure({ openOnClick: false, autolink: false }),
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  RichImage,
  TableKit.configure({ resizable: false }),
  Placeholder.configure({ placeholder: 'Start writing your article…' })
];

export const richSchema = getSchema(buildExtensions());

export const generateBlogHTML = (nodes) => {
  if (!Array.isArray(nodes) || !nodes.length) return '';
  try {
    return generateHTML({ type: 'doc', content: nodes }, buildExtensions());
  } catch (err) {
    return '';
  }
};

const nodeText = (node) =>
  (node?.content || [])
    .map((c) => (c.type === 'text' ? c.text || '' : nodeText(c)))
    .join('');

export const plainText = (nodes) =>
  (Array.isArray(nodes) ? nodes : nodes?.content || []).map((n) => nodeText(n)).join('\n');

export const extractHeadings = (nodes) => {
  const out = [];
  const walk = (list) => {
    (list || []).forEach((n) => {
      if (n.type === 'heading') {
        const level = n.attrs?.level || 2;
        if (level >= 2) {
          const text = nodeText(n).trim();
          if (text) out.push({ id: slugify(text), text, level });
        }
      }
      if (Array.isArray(n?.content)) walk(n.content);
    });
  };
  walk(Array.isArray(nodes) ? nodes : nodes?.content);
  return out;
};

export const computeReadingTime = (nodes) => {
  const words = (plainText(nodes).trim().match(/\S+/g) || []).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
};

export const blogReadingTime = (blog) =>
  Array.isArray(blog?.contentJson) && blog.contentJson.length
    ? computeReadingTime(blog.contentJson)
    : blog?.readingTime || '1 min read';

const alignStyle = (attrs) => (attrs?.textAlign ? { textAlign: attrs.textAlign } : undefined);

const wrapMark = (mark, child) => {
  switch (mark.type) {
    case 'bold':
      return <strong>{child}</strong>;
    case 'italic':
      return <em>{child}</em>;
    case 'underline':
      return <u>{child}</u>;
    case 'strike':
      return <s>{child}</s>;
    case 'code':
      return <code>{child}</code>;
    case 'link':
      return (
        <a
          href={mark.attrs?.href || '#'}
          target={mark.attrs?.target || '_blank'}
          rel="noopener noreferrer nofollow"
        >
          {child}
        </a>
      );
    case 'textStyle':
      return mark.attrs?.color ? <span style={{ color: mark.attrs.color }}>{child}</span> : child;
    default:
      return child;
  }
};

const RichText = ({ node }) => {
  const marks = node.marks || [];
  let content = node.text || '';
  marks.forEach((mark) => {
    content = wrapMark(mark, content);
  });
  return content;
};

const RichNode = ({ node }) => {
  const children = (node.content || []).map((c, i) => (
    <RichNode key={i} node={c} />
  ));

  switch (node.type) {
    case 'text':
      return <RichText node={node} />;
    case 'paragraph':
      return <p style={alignStyle(node.attrs)}>{children}</p>;
    case 'heading': {
      const level = Math.min(Math.max(node.attrs?.level || 2, 1), 4);
      const Tag = `h${level}`;
      return (
        <Tag id={slugify(nodeText(node))} style={alignStyle(node.attrs)} className="rich-heading">
          {children}
        </Tag>
      );
    }
    case 'bulletList':
      return <ul>{children}</ul>;
    case 'orderedList':
      return <ol start={node.attrs?.start || 1}>{children}</ol>;
    case 'listItem':
      return <li>{children}</li>;
    case 'blockquote':
      return <blockquote>{children}</blockquote>;
    case 'codeBlock':
      return (
        <pre>
          <code>{nodeText(node)}</code>
        </pre>
      );
    case 'horizontalRule':
      return <hr />;
    case 'hardBreak':
      return <br />;
    case 'image': {
      const { src, alt, caption, title } = node.attrs || {};
      return (
        <figure className="rich-figure">
          <div className="rich-img-wrap">
            <img src={src} alt={alt || caption || ''} title={title || undefined} loading="lazy" />
          </div>
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
      );
    }
    case 'table':
      return (
        <div className="rich-table-wrap">
          <table>
            <tbody>{children}</tbody>
          </table>
        </div>
      );
    case 'tableRow':
      return <tr>{children}</tr>;
    case 'tableHeader':
      return <th>{children}</th>;
    case 'tableCell':
      return <td>{children}</td>;
    default:
      return children.length ? <Fragment>{children}</Fragment> : null;
  }
};

export const RichDoc = ({ nodes }) => {
  if (!Array.isArray(nodes) || !nodes.length) {
    return <p className="rich-empty">No content yet.</p>;
  }
  return nodes.map((node, i) => <RichNode key={i} node={node} />);
};

const looksLikeHtml = (str) => /<[a-z][\s\S]*>/i.test(str || '');

export const RichContentRenderer = ({ blog }) => {
  if (Array.isArray(blog?.contentJson) && blog.contentJson.length) {
    return (
      <div className="rich-content">
        <RichDoc nodes={blog.contentJson} />
      </div>
    );
  }

  if (Array.isArray(blog?.sections) && blog.sections.length) {
    return (
      <div className="rich-content">
        {blog.sections.map((section, i) => (
          <SectionRenderer key={section._id || i} section={section} />
        ))}
      </div>
    );
  }

  const content = blog?.content || '';

  if (looksLikeHtml(content)) {
    return (
      <div
        className="rich-content"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content, { USE_PROFILES: { html: true } }) }}
      />
    );
  }

  return (
    <div className="rich-content">
      {content.trim()
        ? content.split(/\n+/).filter(Boolean).map((line, i) => <p key={i}>{line}</p>)
        : <p className="rich-empty">No content yet.</p>}
    </div>
  );
};

export default RichContentRenderer;
