import React, { useState } from 'react';
import { CanvasNode, DropPosition } from '../types';

interface NodeRendererProps {
  node: CanvasNode;
  selectedId: string | null;
  onSelectNode: (id: string, e: React.MouseEvent) => void;
  isPreviewMode: boolean;
  dropTargetId: string | null;
  dropPosition: DropPosition | null;
  onDragOverNode: (e: React.DragEvent, id: string) => void;
  onDropNode: (e: React.DragEvent, id: string) => void;
}

export const NodeRenderer: React.FC<NodeRendererProps> = ({
  node,
  selectedId,
  onSelectNode,
  isPreviewMode,
  dropTargetId,
  dropPosition,
  onDragOverNode,
  onDropNode,
}) => {
  // If hidden, don't render in canvas
  if (node.hidden) return null;

  const isSelected = selectedId === node.id && !isPreviewMode;
  const isDropTarget = dropTargetId === node.id && !isPreviewMode;

  const style = node.style || {};
  const props = node.props || {};

  // Interactive local states for interactive components in preview
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [switchChecked, setSwitchChecked] = useState(props.checked ?? true);
  const [checkboxChecked, setCheckboxChecked] = useState(props.checked ?? true);
  const [accordionOpen, setAccordionOpen] = useState<Record<number, boolean>>({ 0: true });

  const handleClick = (e: React.MouseEvent) => {
    if (!isPreviewMode) {
      e.stopPropagation();
      onSelectNode(node.id, e);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isPreviewMode) {
      e.stopPropagation();
      e.preventDefault();
      onDragOverNode(e, node.id);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isPreviewMode) {
      e.stopPropagation();
      e.preventDefault();
      onDropNode(e, node.id);
    }
  };

  // Selection outline & drop indicators
  const selectionClasses = isSelected
    ? 'ring-2 ring-[#0d99ff] ring-offset-1 ring-offset-[#1e1e1e] relative'
    : '';

  const dropClasses = isDropTarget
    ? dropPosition === 'inside'
      ? 'ring-2 ring-violet-500 bg-violet-500/10'
      : dropPosition === 'before'
      ? 'border-t-2 border-t-pink-500'
      : 'border-b-2 border-b-pink-500'
    : '';

  // Render children recursively
  const renderChildren = () => {
    if (!node.children || node.children.length === 0) {
      if (node.isContainer && !isPreviewMode) {
        return (
          <div className="w-full py-4 border border-dashed border-zinc-700 rounded-md flex items-center justify-center text-zinc-500 text-xs select-none">
            Drop components here
          </div>
        );
      }
      return null;
    }

    return node.children.map((child) => (
      <NodeRenderer
        key={child.id}
        node={child}
        selectedId={selectedId}
        onSelectNode={onSelectNode}
        isPreviewMode={isPreviewMode}
        dropTargetId={dropTargetId}
        dropPosition={dropPosition}
        onDragOverNode={onDragOverNode}
        onDropNode={onDropNode}
      />
    ));
  };

  // Switch component type rendering
  const renderComponentBody = () => {
    switch (node.type) {
      // 1. LAYOUT
      case 'container':
      case 'stack':
      case 'columns':
        return (
          <div
            id={node.id}
            style={style}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`${selectionClasses} ${dropClasses} transition-all`}
          >
            {renderChildren()}
          </div>
        );

      case 'grid':
        return (
          <div
            id={node.id}
            style={style}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`${selectionClasses} ${dropClasses} transition-all`}
          >
            {renderChildren()}
          </div>
        );

      case 'aspect_ratio':
        return (
          <div
            id={node.id}
            style={style}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`${selectionClasses} ${dropClasses} overflow-hidden`}
          >
            {renderChildren()}
          </div>
        );

      case 'scroll_area':
        return (
          <div
            id={node.id}
            style={style}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`${selectionClasses} ${dropClasses} overflow-auto`}
          >
            {renderChildren()}
          </div>
        );

      case 'separator':
        return (
          <div
            id={node.id}
            style={style}
            onClick={handleClick}
            className={`${selectionClasses} select-none`}
          />
        );

      // 2. NAVIGATION
      case 'navbar':
        return (
          <header
            id={node.id}
            style={style}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`${selectionClasses} ${dropClasses}`}
          >
            <div className="font-bold text-base tracking-tight text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0d99ff]" />
              {props.brand || 'Brand'}
            </div>
            <nav className="flex items-center gap-6 text-sm text-zinc-300">
              {(props.links || []).map((l: any, i: number) => (
                <a
                  key={i}
                  href={l.href}
                  onClick={(e) => isPreviewMode ? null : e.preventDefault()}
                  className="hover:text-white transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-2">{renderChildren()}</div>
          </header>
        );

      case 'nav_tabs':
        return (
          <div
            id={node.id}
            style={style}
            onClick={handleClick}
            className={`${selectionClasses}`}
          >
            {(props.tabs || []).map((tab: string, i: number) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTabIdx(i);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTabIdx === i
                    ? 'bg-zinc-800 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        );

      case 'breadcrumb':
        return (
          <div
            id={node.id}
            style={style}
            onClick={handleClick}
            className={`${selectionClasses} select-none`}
          >
            {(props.items || []).map((item: string, i: number) => (
              <React.Fragment key={i}>
                <span className={i === (props.items.length - 1) ? 'text-zinc-200 font-medium' : 'hover:underline cursor-pointer'}>
                  {item}
                </span>
                {i < props.items.length - 1 && <span className="text-zinc-600">/</span>}
              </React.Fragment>
            ))}
          </div>
        );

      // 3. FORMS & INPUTS
      case 'button':
        return (
          <button
            id={node.id}
            style={style}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`${selectionClasses} ${dropClasses} transition-opacity active:opacity-90`}
          >
            {props.label || 'Button'}
            {renderChildren()}
          </button>
        );

      case 'input':
        return (
          <div
            id={node.id}
            onClick={handleClick}
            className={`${selectionClasses} space-y-1 w-full`}
          >
            {props.label && (
              <label className="block text-xs font-medium text-zinc-300">
                {props.label}
              </label>
            )}
            <input
              type={props.type || 'text'}
              placeholder={props.placeholder || ''}
              disabled={!isPreviewMode}
              style={style}
              className="w-full focus:outline-none focus:ring-1 focus:ring-[#0d99ff]"
            />
          </div>
        );

      case 'textarea':
        return (
          <div
            id={node.id}
            onClick={handleClick}
            className={`${selectionClasses} w-full`}
          >
            <textarea
              placeholder={props.placeholder || ''}
              disabled={!isPreviewMode}
              style={style}
              className="w-full focus:outline-none focus:ring-1 focus:ring-[#0d99ff]"
            />
          </div>
        );

      case 'switch':
        return (
          <div
            id={node.id}
            style={style}
            onClick={(e) => {
              handleClick(e);
              if (isPreviewMode) setSwitchChecked(!switchChecked);
            }}
            className={`${selectionClasses} cursor-pointer`}
          >
            <div
              className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                switchChecked ? 'bg-[#0d99ff]' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  switchChecked ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
            {props.label && <span className="text-xs text-zinc-300">{props.label}</span>}
          </div>
        );

      case 'checkbox':
        return (
          <div
            id={node.id}
            style={style}
            onClick={(e) => {
              handleClick(e);
              if (isPreviewMode) setCheckboxChecked(!checkboxChecked);
            }}
            className={`${selectionClasses} cursor-pointer`}
          >
            <div
              className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                checkboxChecked
                  ? 'bg-[#0d99ff] border-[#0d99ff] text-white'
                  : 'border-zinc-600 bg-zinc-800'
              }`}
            >
              {checkboxChecked && <span className="text-[10px]">✓</span>}
            </div>
            <span>{props.label}</span>
          </div>
        );

      case 'badge':
        return (
          <span
            id={node.id}
            style={style}
            onClick={handleClick}
            className={`${selectionClasses}`}
          >
            {props.label || 'Badge'}
          </span>
        );

      // 4. DATA DISPLAY
      case 'card':
        return (
          <div
            id={node.id}
            style={style}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`${selectionClasses} ${dropClasses}`}
          >
            {props.title && (
              <div className="border-b border-zinc-800 pb-2 mb-2">
                <h4 className="font-semibold text-zinc-100 text-sm">{props.title}</h4>
                {props.subtitle && (
                  <p className="text-zinc-400 text-xs">{props.subtitle}</p>
                )}
              </div>
            )}
            {renderChildren()}
          </div>
        );

      case 'accordion':
        return (
          <div
            id={node.id}
            style={style}
            onClick={handleClick}
            className={`${selectionClasses}`}
          >
            {(props.items || []).map((item: any, i: number) => {
              const isOpen = accordionOpen[i];
              return (
                <div key={i} className="border-b border-zinc-800 last:border-b-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAccordionOpen((prev) => ({ ...prev, [i]: !prev[i] }));
                    }}
                    className="w-full text-left px-4 py-3 flex items-center justify-between text-xs font-medium text-zinc-200 hover:text-white"
                  >
                    <span>{item.title}</span>
                    <span className="text-zinc-400 text-sm">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3 text-xs text-zinc-400">
                      {item.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );

      case 'progress':
        return (
          <div
            id={node.id}
            style={style}
            onClick={handleClick}
            className={`${selectionClasses}`}
          >
            <div
              style={{
                width: `${props.value || 50}%`,
                backgroundColor: props.color || '#0d99ff',
                height: '100%',
                borderRadius: '9999px',
              }}
            />
          </div>
        );

      // 5. MEDIA & VECTORS
      case 'fontawesome_icon':
        return (
          <div
            id={node.id}
            onClick={handleClick}
            className={`${selectionClasses} inline-flex items-center justify-center`}
          >
            <i
              className={`${props.prefix || 'fas'} ${props.iconName || 'fa-star'}`}
              style={style}
            />
          </div>
        );

      case 'image':
        return (
          <div
            id={node.id}
            onClick={handleClick}
            className={`${selectionClasses} inline-block overflow-hidden`}
          >
            <img
              src={props.src}
              alt={props.alt || ''}
              style={style}
              className="pointer-events-none"
            />
          </div>
        );

      case 'typography':
        const Tag = props.as || 'p';
        return (
          <Tag
            id={node.id}
            style={style}
            onClick={handleClick}
            className={`${selectionClasses}`}
          >
            {props.text || 'Typography text'}
          </Tag>
        );

      default:
        return (
          <div
            id={node.id}
            style={style}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`${selectionClasses} ${dropClasses}`}
          >
            {props.label || node.type}
            {renderChildren()}
          </div>
        );
    }
  };

  return renderComponentBody();
};
