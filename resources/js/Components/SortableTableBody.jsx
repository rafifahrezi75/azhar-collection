import React, { useMemo } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export function SortableRow({ id, children, className }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 0,
        position: 'relative',
    };

    return (
        <tr
            ref={setNodeRef}
            style={style}
            className={`${className || ''} ${isDragging ? 'bg-teal-50/80 shadow-md ring-1 ring-teal-500/20' : ''}`}
        >
            <td className="px-2 py-2 text-slate-400 w-10 text-center cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
                <GripVertical className="w-4 h-4 inline-block hover:text-teal-600" />
            </td>
            {children}
        </tr>
    );
}

export default function SortableTableBody({ items, onReorder, children }) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const itemIds = useMemo(() => items.map(i => i.id), [items]);

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((i) => i.id === active.id);
            const newIndex = items.findIndex((i) => i.id === over.id);
            const newItems = arrayMove(items, oldIndex, newIndex);
            
            if (oldIndex !== newIndex) {
                onReorder(newItems);
            }
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={itemIds}
                strategy={verticalListSortingStrategy}
            >
                <tbody className="divide-y divide-slate-100 text-sm">
                    {children}
                </tbody>
            </SortableContext>
        </DndContext>
    );
}
