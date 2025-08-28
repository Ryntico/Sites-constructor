import type { JSX } from 'react';

type PaletteItemProps = {
  name: string;
  mimeKey: string;
  icon: JSX.Element;
};

export function PaletteItem({ name, mimeKey, icon }: PaletteItemProps) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/x-block-template', mimeKey);
        e.dataTransfer.effectAllowed = 'copy';
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #e6e8ef',
        borderRadius: 10,
        padding: 10,
        background: '#fff',
        cursor: 'grab',
        fontSize: 13,
        lineHeight: 1.2,
        minHeight: 80,
        height: '100%',
      }}
      title={name}
    >
      <div style={{ marginBottom: 8 }}>
        {icon}
      </div>
      <div style={{ textAlign: 'center', color: '#878787', fontSize: 12 }}>{name}</div>
    </div>
  );
}