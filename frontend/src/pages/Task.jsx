import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Textarea } from "../components/utils/Input";
import Loader from "../components/utils/Loader";
import useFetch from "../hooks/useFetch";
import MainLayout from "../layouts/MainLayout";
import validateManyFields from "../validations";

const Task = () => {
  const authState = useSelector((state) => state.authReducer);
  const navigate = useNavigate();
  const [fetchData, { loading }] = useFetch();
  const { taskId } = useParams();

  const mode = taskId === undefined ? "add" : "update";
  const [task, setTask] = useState(null);
  const [formData, setFormData] = useState({
    description: "",
    task_priority: "",
    task_completed: false,
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    document.title = mode === "add" ? "Add task" : "Update Task";
  }, [mode]);

  useEffect(() => {
    if (mode === "update") {
      const config = {
        url: `/tasks/${taskId}`,
        method: "get",
        headers: { Authorization: authState.token },
      };
      fetchData(config, { showSuccessToast: false }).then((data) => {
        setTask(data.task);
        setFormData({
          description: data?.task?.description,
          task_priority: data?.task?.task_priority,
        });
      });
    }
  }, [mode, authState, taskId, fetchData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Update the formData based of input typeee
    const newValue = type === 'checkbox' ? checked : value;
  
    setFormData({
      ...formData,
      [name]: newValue,
    });
  };



  const handleReset = (e) => {
    e.preventDefault();
    setFormData({
      description: task?.description,
      task_priority: task?.task_priority,
      task_completed: task?.task_completed
    });
  };

  console.log(formData.task_completed);

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateManyFields("task", formData);
    setFormErrors({});

    if (errors.length > 0) {
      setFormErrors(
        errors.reduce((total, ob) => ({ ...total, [ob.field]: ob.err }), {})
      );
      return;
    }

    if (mode === "add") {
      const config = {
        url: "/tasks",
        method: "post",
        data: formData,
        headers: { Authorization: authState.token },
      };
      fetchData(config).then(() => {
        navigate("/");
      });
    } else {
      const config = {
        url: `/tasks/${taskId}`,
        method: "put",
        data: formData,
        headers: { Authorization: authState.token },
      };
      fetchData(config).then(() => {
        navigate("/");
      });
    }
  };

  const fieldError = (field) => (
    <p
      className={`mt-1 text-pink-600 text-sm ${
        formErrors[field] ? "block" : "hidden"
      }`}
    >
      <i className="mr-2 fa-solid fa-circle-exclamation"></i>
      {formErrors[field]}
    </p>
  );

  useEffect(() => {
    if(task?.task_completed === true) {
      setFormData(prevFormData => ({...prevFormData, task_completed: task?.task_completed}));
    } else {
      setFormData(prevFormData => ({...prevFormData, task_completed: false}));
    }
  }, [task]);

  return (
    <>
      <MainLayout>
        <form className="m-auto my-16 max-w-[1000px] bg-white p-8 border-2 shadow-md rounded-md">
          {loading ? (
            <Loader />
          ) : (
            <>
              <h2 className="text-center mb-4">
                {mode === "add" ? "Add New Task" : "Edit Task"}
              </h2>
              <div className="mb-4">
                <label htmlFor="description">Description</label>
                <Textarea
                  type="description"
                  name="description"
                  id="description"
                  value={formData?.description}
                  placeholder="Write here.."
                  onChange={handleChange}
                />
                {fieldError("description")}
              </div>

              <div className="flex gap-6 items-center">
                <div className="mb-4 flex flex-col gap-3">
                  <label htmlFor="priority">Priority</label>
                  <select
                    name="task_priority"
                    value={formData?.task_priority}
                    onChange={handleChange}
                    id="priority"
                    className="w-[100px] px-3 py-2 mr-2"
                  >
                    <option value="">choose a priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="flex justify-center items-center gap-4">
                  <input  checked={formData?.task_completed}  name="task_completed" onChange={handleChange} className="w-[20px] h-[20px]" type="checkbox" />
                  <span>Completed</span>
                </div>
              </div>

              <button
                className="bg-primary text-white px-4 py-2 font-medium hover:bg-primary-dark"
                onClick={handleSubmit}
              >
                {mode === "add" ? "Add task" : "Update Task"}
              </button>
              <button
                className="ml-4 bg-red-500 text-white px-4 py-2 font-medium"
                onClick={() => navigate("/")}
              >
                Cancel
              </button>
              {mode === "update" && (
                <button
                  className="ml-4 bg-blue-500 text-white px-4 py-2 font-medium hover:bg-blue-600"
                  onClick={handleReset}
                >
                  Reset
                </button>
              )}
            </>
          )}
        </form>
      </MainLayout>
    </>
  );
};

export default Task;
