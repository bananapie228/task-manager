const express = require('express');
const app = express();
const fs = require('fs');
const PORT = 3000;

app.use(express.json())

const data_file = './data.json'


const getData = () => JSON.parse(fs.readFileSync(data_file));
const saveData = (data) => fs.writeFileSync(data_file, JSON.stringify(data, null, 2));


// demo routes

app.get('/', (request, response) => {
    response.send("Server is runnin")
});
app.get('/hello', (request, response) => {
    response.json("heelo from server")
});
app.get('/time', (request, response) => {
    const time = new Date().toLocaleDateString();
    response.send(time);
});
app.get('/status', (request, response) => {
    response.status(200).json({status: "ok"});
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});


// crud operations


app.get('/tasks', (request, response) =>{
    const tasks = getData();
    response.json(tasks);
})

app.post('/tasks', (request, response) =>{
    const tasks = getData();
    const task = request.body.name;
    const newTask = {
        id: tasks.length + 1,
        name: task,
        completed: false
    };

    
    tasks.push(newTask);
    saveData(tasks)
    
    response.status(201).json(newTask);
});

app.put('/tasks/:id', (request, response) =>{
    const tasks = getData()
    const task = request.body.name;
    const id = parseInt(request.params.id)

    const index = tasks.findIndex(t => t.id == id)

    if (index !== -1){
        tasks[index].name = request.body.name
        saveData(tasks)
        response.json(task[index])
    }
    else{
        response.status(404).json("not found");
    }
});

app.delete('/tasks/:id', (request, response) => {
    const tasks = getData();  
    const idToDelete = parseInt(request.params.id);
    const updatedTasks = tasks.filter(task => task.id !== idToDelete);
    saveData(updatedTasks);
    response.json({ success: true });
});

