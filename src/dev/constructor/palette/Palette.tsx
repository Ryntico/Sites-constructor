import { useState, useRef, type JSX } from 'react';
import { PaletteItem } from "./PaletteItem"
import {
  ChevronLeft,
  DoubleChevronRight,
  BoxCard,
  RichText,
  Image,
  Button,
  Form,
  Blockquote,
  Select,
  Input,
  Textarea,
  Divider,
  Header,
  Paragraph
} from './PaletteIcons';

const icons = {
  'box_card': BoxCard,
  'richtext': RichText,
  'image_card': Image,
  'button_primary': Button,
  'form': Form,
  'input': Input,
  'select': Select,
  'textarea': Textarea,
  'blockquote': Blockquote,
  'divider': Divider,
  'heading_h1': Header,
  'paragraph': Paragraph,
};

export function Palette({ items }: { items: { id: string; name: string }[] }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const itemsForMutateSort = [...items];

  const manualSortedIds = [
    'box_card',
    'heading_h1',
    'richtext',
    'image_card',
    'button_primary',
    'form',
    'input',
    'select',
    'textarea',
    'blockquote',
    'divider'
  ];

  manualSortedIds.reverse().forEach((sortedId) => {
    const i = itemsForMutateSort.findIndex((item) => item.id === sortedId);
    if (i !== -1) {
      const [item] = itemsForMutateSort.splice(i, 1);
      itemsForMutateSort.unshift(item);
    }
  });

  const itemsForRender : { id: string; name: string; icon: JSX.Element }[] = itemsForMutateSort.map((item) => ({
    ...item,
    icon: icons[item.id as keyof typeof icons] || icons['box_card'],
  }));

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      ref={contentRef}
      style={{
        display: 'grid',
        gap: 10,
        padding: isCollapsed ? '4px 0 0 0' : '4px',
        alignContent: 'start',
        justifyContent: 'center',
        border: '1px solid #e6e8ef',
        borderRadius: 12,
        height: 'calc(100vh - 160px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        width: isCollapsed ? '20px' : '240px',
        transition: 'width 0.3s ease-in-out, min-width 0.3s ease-in-out',
        position: 'relative',
        willChange: 'width, min-width',
      }}
    >
      <div
        style={{
          width: isCollapsed ? '20px' : '240px',
          overflowX: 'hidden',
          overflowY: 'auto',
          height: '100%',
        }}
      >
        {isCollapsed ? (
          <div
            onClick={toggleCollapse}
            style={{
              color: '#64748b',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <DoubleChevronRight />
          </div>
        ) : (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0 8px',
            }}>
              <div style={{ fontWeight: 600 }}>Элементы</div>
              <button
                onClick={toggleCollapse}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  transition: 'color 0.2s ease-in-out',
                }}
              >
                <ChevronLeft />
              </button>
            </div>
            <div
              style={{
                padding: '0 8px',
                fontWeight: 100,
                fontSize: 12,
                color: '#878787' }}>Перетащите
              в редактор
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              alignItems: 'start',
              opacity: isCollapsed ? 0 : 1,
              transition: 'opacity 0.2s ease-in-out',
              padding: '4px',
            }}>
              {itemsForRender.map((i) => (
                <PaletteItem key={i.id} name={i.name} mimeKey={i.id} icon={i.icon} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}