import "./Column.css";
import React from "react";


import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import Task from "../Task/Task";

const Column = ({tasks}) => {
  return (
    <div className="cont">
    <div className='column'>
    <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
    {tasks.map((task) =>(
        <Task id={task.id} title={task.title} reporter={task.reporter} key={task.id}/>
    ))}
    </SortableContext>
    </div>
    </div>
  )
}

export default Column;
