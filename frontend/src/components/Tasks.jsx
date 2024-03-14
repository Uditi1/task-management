import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import Loader from "./utils/Loader";

const Tasks = () => {
  const authState = useSelector((state) => state.authReducer);
  const [tasks, setTasks] = useState([]);
  const [fetchData, { loading }] = useFetch();
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");

  const fetchTasks = useCallback(() => {
    let url = "/tasks";
    const params = new URLSearchParams();
    if (selectedStatus) {
      params.append("task_completed", selectedStatus);
    }
    if (selectedPriority !== "") {
      params.append("sort_priority", selectedPriority);
    }
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    const config = {
      url: url,
      method: "get",
      headers: { Authorization: authState.token },
    };
    fetchData(config, { showSuccessToast: false }).then((data) =>
      setTasks(data.tasks)
    );
  }, [authState.token, fetchData, selectedStatus, selectedPriority]);

  useEffect(() => {
    if (!authState.isLoggedIn) return;
    fetchTasks();
  }, [authState.isLoggedIn, fetchTasks, selectedStatus, selectedPriority]);

  const handleDelete = (id) => {
    const config = {
      url: `/tasks/${id}`,
      method: "delete",
      headers: { Authorization: authState.token },
    };
    fetchData(config).then(() => fetchTasks());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "status") {
      setSelectedStatus(value);
    } else if (name === "priority") {
      setSelectedPriority(value);
    }
  };

  return (
    <>
      <div className="my-2 mx-auto max-w-[700px] py-4">
        <div className="flex justify-between">
          {tasks?.length !== 0 && (
            <h2 className="my-2 ml-2 md:ml-0 text-xl">
              Your tasks ({tasks?.length})
            </h2>
          )}
          <div className="flex gap-2">
            <div className="mb-4 flex flex-col gap-3">
              <label>Filter By status</label>
              <select
                name="status"
                value={selectedStatus}
                onChange={handleChange}
                className="w-[160px] px-3 py-2 mr-2"
              >
                <option value="">choose a status</option>
                <option value="true">Completed</option>
                <option value="false">Incomplete</option>
              </select>
            </div>

            <div className="mb-4 flex flex-col gap-3">
              <label>Sort By Priority</label>
              <select
                name="priority"
                value={selectedPriority}
                onChange={handleChange}
                className="w-[160px] px-3 py-2 mr-2"
              >
                <option value="">choose the priority</option>
                <option value="true">High to Low</option>
                <option value="false">Low to High</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div>
            {tasks?.length === 0 ? (
              <div className="w-[600px] h-[300px] flex items-center justify-center gap-4">
                <span>No tasks found</span>
                <Link
                  to="/tasks/add"
                  className="bg-blue-500 text-white hover:bg-blue-600 font-medium rounded-md px-4 py-2"
                >
                  + Add new task{" "}
                </Link>
              </div>
            ) : (
              tasks.map((task, index) => (
                <div
                  key={task?._id}
                  className="bg-white my-4 p-4 text-gray-600 rounded-md shadow-md"
                >
                  <div className="flex">
                    <span className="font-medium">Task #{index + 1}</span>
                    <span
                      className={`mx-5 font-bold ${
                        task?.task_priority === "high"
                          ? "text-red-500"
                          : task?.task_priority === "low"
                          ? "text-black"
                          : "text-yellow-500"
                      }`}
                    >
                      {task?.task_priority}
                    </span>
                    <span
                      className={`mx-2 font-bold ${
                        task?.task_completed
                          ? "text-green-500"
                          : "text-pink-400"
                      }`}
                    >
                      {task?.task_completed ? "Completed" : "Incomplete"}
                    </span>

                    <Link
                      to={`/tasks/${task?._id}`}
                      className="ml-auto mr-2 text-green-600 cursor-pointer"
                    >
                      <i className="fa-solid fa-pen"></i>
                    </Link>

                    <span
                      className="text-red-500 cursor-pointer"
                      onClick={() => handleDelete(task._id)}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </span>
                  </div>
                  <div className="whitespace-pre">{task?.description}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Tasks;
