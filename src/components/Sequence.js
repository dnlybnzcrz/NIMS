import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import "../styles/Sequence.css"
import axios from "axios";

import { DndContext, KeyboardSensor, PointerSensor, TouchSensor, closestCorners, useSensor, useSensors } from "@dnd-kit/core";
import Column from "./Column/Column";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import Input from "./Input/Input";






function Sequence() {

    const [newsList, setNewsList] = useState([]);

    const config = {
        headers: {
          Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
        },
      };

      useEffect(() => {
        axios
          .get("https://api.radiopilipinas.online/nims/view", config)
          .then((res) => {
            //console.log(res.data.newsDataList);
            setNewsList(res.data.newsDataList);
          })
          .catch((err) => {
            console.log(err);
          });
      });





    const [tasks, setTasks] = useState([



        { id: 1, title: "Report one"},
        { id: 2, title: "Report two"},
        { id: 3, title: "Report three"},
        { id: 4, title: "Report four"},
        { id: 5, title: "Report five"},
        { id: 6, title: "Report six"},
        { id: 7, title: "Report seven"},
        { id: 8, title: "Report eight"},
        { id: 9, title: "Report nine"},

    ]);

    const addTask = title => {
        setTasks(tasks=> [...tasks, {id: tasks.length + 1, title}])
    }

    const getTaskPos = id => tasks.findIndex(task => task.id === id)

    const handleDragEnd = event => {
        const {active, over} = event

        if(active.id === over.id) return;

        setTasks(tasks =>{
            const originalPos = getTaskPos(active.id)
            const newPos = getTaskPos(over.id)

            return arrayMove(tasks, originalPos, newPos);

        });


    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates, }),
    );





  return (
    <div>
    <Navbar />

    <h1>Sequence Guide</h1>
    <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
        <Input onSubmit = {addTask}/>
        <Column tasks={tasks}/>
    </DndContext>
    </div>
  )
}

export default Sequence;