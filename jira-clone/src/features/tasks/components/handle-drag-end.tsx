import { DropResult } from "@hello-pangea/dnd";
import { Task, TaskStatus } from "../types";

type TasksState = {
  [key in TaskStatus]: Task[];
};

type UpdatePayload = {
  $id: string;
  status: TaskStatus;
  position: number;
};

export const handleDragEnd = (
  result: DropResult,
  setTasks: React.Dispatch<React.SetStateAction<TasksState>>,
  onChange: (updates: UpdatePayload[]) => void
) => {
  if (!result.destination) return;

  const { source, destination } = result;
  const sourceStatus = source.droppableId as TaskStatus;
  const destStatus = destination.droppableId as TaskStatus;

  const updatesPayload: UpdatePayload[] = [];

  setTasks((prevTasks) => {
    const newTasks = { ...prevTasks };
    const sourceColumn = [...newTasks[sourceStatus]];
    const [movedTask] = sourceColumn.splice(source.index, 1);

    if (!movedTask) {
      console.error("No task found at the source index");
      return prevTasks;
    }

    const updatedMovedTask =
      sourceStatus !== destStatus
        ? { ...movedTask, status: destStatus }
        : movedTask;

    newTasks[sourceStatus] = sourceColumn;

    const destColumn = [...newTasks[destStatus]];
    destColumn.splice(destination.index, 0, updatedMovedTask);
    newTasks[destStatus] = destColumn;

    updatesPayload.push({
      $id: updatedMovedTask.$id,
      status: destStatus,
      position: Math.min((destination.index + 1) * 1000, 1_000_000),
    });

    newTasks[destStatus].forEach((task, index) => {
      if (task && task.$id !== updatedMovedTask.$id) {
        const newPosition = Math.min((index + 1) * 1000, 1_000_000);
        if (Number(task.position) !== newPosition) {
          updatesPayload.push({
            $id: task.$id,
            status: destStatus,
            position: newPosition,
          });
        }
      }
    });

    if (sourceStatus !== destStatus) {
      newTasks[sourceStatus].forEach((task, index) => {
        if (task) {
          const newPosition = Math.min((index + 1) * 1000, 1_000_000);
          if (Number(task.position) !== newPosition) {
            updatesPayload.push({
              $id: task.$id,
              status: sourceStatus,
              position: newPosition,
            });
          }
        }
      });
    }

    return newTasks;
  });

  onChange(updatesPayload);
};
