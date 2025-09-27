import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const ProjectEdit = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`${API_URL}/project/${projectId}`, {
          withCredentials: true,
        });
        const project = res.data.project;
        if (project.leader_id !== user.id) {
          toast.error("Only the project leader can edit this project.");
          navigate(-1);
          return;
        }
        setValue("title", project.title);
        setValue("timeline", project.timeline);
        setValue("description", project.description);
        setValue("goals", project.goals);
        setValue("requiredSkills", project.required_skills?.join(", "));
        setValue("techStack", project.tech_stack?.join(", "));
        setValue("maxMembers", project.max_members);
        setPreview(
          project.project_image ? `${API_URL}${project.project_image}` : null
        );
        setLoading(false);
      } catch (error) {
        toast.error("Failed to load project.");
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId, user, setValue, navigate]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (data.projectImage && data.projectImage[0]) {
        formData.set("projectImage", data.projectImage[0]);
      }
      const response = await axios.put(
        `${API_URL}/project/${projectId}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success(response.data.message);
      navigate(`/project/${projectId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Project update failed.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <svg
          className="animate-spin h-10 w-10 text-orange-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="mt-4 text-lg">Loading project...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <h2 className="text-4xl font-bold text-center text-orange-500 mb-8">
          Edit Project
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-gray-800 p-8 rounded-xl shadow-2xl space-y-6"
          encType="multipart/form-data"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-gray-300 mb-1">
                Project Title
              </label>
              <input
                type="text"
                id="title"
                {...register("title", { required: "Title is required" })}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.title && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="timeline" className="block text-gray-300 mb-1">
                Timeline{" "}
                <span className="text-gray-400 text-xs">
                  (Enter number of days)
                </span>
              </label>
              <input
                type="number"
                id="timeline"
                min="1"
                step="1"
                placeholder="e.g., 30"
                {...register("timeline", {
                  required: "Timeline is required",
                  valueAsNumber: true,
                  min: { value: 1, message: "Timeline must be at least 1 day" },
                  validate: (value) =>
                    Number.isInteger(value) || "Enter a whole number of days",
                })}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.timeline && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.timeline.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-gray-300 mb-1">
              Project Description
            </label>
            <textarea
              id="description"
              rows="4"
              {...register("description", {
                required: "Description is required",
              })}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
            ></textarea>
            {errors.description && (
              <p className="text-red-400 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="goals" className="block text-gray-300 mb-1">
              Goals
            </label>
            <textarea
              id="goals"
              rows="3"
              {...register("goals", { required: "Goals are required" })}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
            ></textarea>
            {errors.goals && (
              <p className="text-red-400 text-sm mt-1">
                {errors.goals.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="motivation" className="block text-gray-300 mb-1">
              Why should members join? (Motivation)
            </label>
            <textarea
              id="motivation"
              rows="3"
              {...register("motivation")}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
            ></textarea>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="requiredSkills"
                className="block text-gray-300 mb-1"
              >
                Required Skills (Comma separated)
              </label>
              <input
                type="text"
                id="requiredSkills"
                {...register("requiredSkills")}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label htmlFor="techStack" className="block text-gray-300 mb-1">
                Tech Stack (Comma separated)
              </label>
              <input
                type="text"
                id="techStack"
                {...register("techStack")}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="maxMembers" className="block text-gray-300 mb-1">
                Max Members (Max 8)
              </label>
              <input
                type="number"
                id="maxMembers"
                {...register("maxMembers", {
                  valueAsNumber: true,
                  min: 1,
                  max: 8,
                })}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.maxMembers && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.maxMembers.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="projectImage"
                className="block text-gray-300 mb-1"
              >
                Project Image
              </label>
              <input
                type="file"
                id="projectImage"
                accept="image/*"
                {...register("projectImage")}
                onChange={handleImageChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mt-4 w-full h-48 object-cover rounded-lg border-2 border-orange-500 shadow"
                />
              )}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition duration-200"
          >
            Update Project <ArrowRight size={20} className="inline ml-2" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ProjectEdit;
