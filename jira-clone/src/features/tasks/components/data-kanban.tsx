import { Task, TaskStatus } from "../types";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import React, { useCallback, useEffect, useState } from "react";
import { KanbanColumnHeader } from "./kanban-column-header";
import { KanbanCard } from "./kanban-card";
import { handleDragEnd } from "./handle-drag-end";

const boards: TaskStatus[] = [
    TaskStatus.BACKLOG,
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.IN_REVIEW,
    TaskStatus.DONE,
];
type TasksState = {
    [ key in TaskStatus ]: Task[];
};

interface DataKanbanProps {
    data: Task[];
    onChange: (tasks: {$id: string; status: TaskStatus; position: number;}[]) => void;
};

export const DataKanban = ({ data, onChange }: DataKanbanProps) => {
    const [tasks, setTasks] = useState<TasksState>(() => {
        const initialTasks: TasksState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: [],
        };
        data.forEach((task) => {
            initialTasks[task.status].push(task);
        });
        Object.keys(initialTasks).forEach((status) => {
            initialTasks[status as TaskStatus].sort((a, b) => {
                return Number(a.position) - Number(b.position);
              })
        });
        return initialTasks;
    });
    useEffect(() => {
        const newTasks: TasksState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: [],
        };
        data.forEach((task) => {
            newTasks[task.status].push(task);
        });
        Object.keys(newTasks).forEach((status) => {
            newTasks[status as TaskStatus].sort((a, b) => {
                return Number(a.position) - Number(b.position);
              })
        });
        setTasks(newTasks);
    }, [data]);

    const onDragEnd = useCallback(
        (result: DropResult) => {
          handleDragEnd(result, setTasks, onChange);
        },
        [onChange]
      );

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex overflow-x-auto">
                {boards.map((board) => {
                    return (
                        <div key={board} className="flex-1 mx-2 bg-muted p-1.5 rounded-md min-w-[200px]">
                            <KanbanColumnHeader
                            board={board}
                            taskCount={tasks[board].length}
                            />
                            <Droppable droppableId={board}>
                                {(provided) => (
                                    <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="min-h-[200px] py-1.5"
                                    >
                                        {tasks[board].map((task, index) => (
                                            <Draggable key={task.$id} draggableId={task.$id} index={index}>
                                                {(provided) => (
                                                    <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    >
                                                        <KanbanCard task={task}/>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    )
                })}
            </div>
        </DragDropContext>
    );
};