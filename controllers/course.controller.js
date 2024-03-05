const Course = require("../models/course.model");
const Lesson = require("../models/lesson.model");
const logger = require('../config/logger.config');
const {setAsync, getAsync} = require("../config/redis.config");

// Create Course
const createCourse = async (req, res) => {
  const course = new Course({ ...req.body, createdBy: req.user._id });

  try {
    await course.save();
    res.status(201).send(course);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Get all courses with caching
const getCourses = async (req, res) => {
  const cacheKey = 'coursesList'; // Unique key for caching
  try {
    const cachedCourses = await getAsync(cacheKey);
    if (cachedCourses) {
      logger.info('Serving courses list from cache');
      return res.status(200).send(JSON.parse(cachedCourses));
    }

    const courses = await Course.find({});
    await setAsync(cacheKey, JSON.stringify(courses), 'EX', 600);
    logger.info('Serving courses list from database and caching result');
    res.status(200).send(courses);
  } catch (error) {
    logger.error(`Error fetching courses: ${error}`);
    res.status(500).send(error);
  }
};


// Get course by ID with caching
const getCourseById = async (req, res) => {
  const _id = req.params.id;
  const cacheKey = `course_${_id}`; // Unique key for caching

  try {
    const cachedCourse = await getAsync(cacheKey);
    if (cachedCourse) {
      let logger;
      logger.info(`Serving course ${_id} from cache`);
      return res.status(200).send(JSON.parse(cachedCourse));
    }

    const course = await Course.findOne({ _id });
    if (!course) {
      return res.status(404).send({ error: "Course not found." });
    }

    await setAsync(cacheKey, JSON.stringify(course), 'EX', 600);
    logger.info(`Serving course ${_id} from database and caching result`);
    res.status(200).send(course);
  } catch (error) {
    logger.error(`Error fetching course by ID (${_id}): ${error}`);
    res.status(500).send(error);
  }
};



// Update course
const updateCourse = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["title", "description"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const course = await Course.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!course) {
      return res.status(404).send({ error: "Course not found." });
    }

    updates.forEach((update) => (course[update] = req.body[update]));
    await course.save();

    res.status(200).send(course);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Delete course
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!course) {
      return res.status(404).send({ error: "Course not found." });
    }

    res.status(200).send(course);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Enroll Course by Student
const enrollInCourse = async (req, res) => {
  const courseId = req.params.id;
  const studentId = req.user._id;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).send({ error: "Course not found" });
    }

    if (course.enrolledStudents.includes(studentId)) {
      return res
        .status(400)
        .send({ error: "Student already enrolled in this course" });
    }

    course.enrolledStudents.push(studentId);
    await course.save();

    res
      .status(200)
      .send({ message: "Enrolled in course successfully", course });
  } catch (error) {
    res.status(500).send({ error: "Error enrolling in course" });
  }
};

const uploadCourseMaterial = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).send({ error: "Course not found" });
    }

    // Save the uploaded file's path to the course materials array
    course.materials.push(req.file.path);
    await course.save();

    res.status(201).send({
      message: "Course material uploaded successfully",
      path: req.file.path,
    });
  } catch (error) {
    res.status(500).send({ error: "Error uploading course material" });
  }
};

// Create course lesson
const createLesson = async (req, res) => {
  const { courseId } = req.params;
  const { title, content } = req.body;

  try {
    const course = await Course.findOne({ _id }).populate('createdBy');
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Ensure the user is the course creator
    if (course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const lesson = new Lesson({
      title,
      content,
      course: courseId,
    });

    await lesson.save();

    course.lessons.push(lesson._id);
    await course.save();

    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getLesson = async (req, res) => {
  const { courseId, lessonId } = req.params;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const lesson = await Lesson.findOne({ _id: lessonId, course: courseId });
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    res.status(200).json(lesson);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateLesson = async (req, res) => {
  const { courseId, lessonId } = req.params;
  const { title, content } = req.body;

  try {
    const course = await Course.findOne({ _id }).populate('createdBy');
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const lesson = await Lesson.findOneAndUpdate(
      { _id: lessonId, course: courseId },
      { title, content },
      { new: true, runValidators: true }
    );

    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    res.status(200).json(lesson);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteLesson = async (req, res) => {
  const { courseId, lessonId } = req.params;

  try {
    const course = await Course.findOne({ _id }).populate('createdBy');
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const lesson = await Lesson.findOneAndDelete({
      _id: lessonId,
      course: courseId,
    });

    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    course.lessons = course.lessons.filter((id) => id.toString() !== lessonId);
    await course.save();

    res.status(200).json({ message: "Lesson deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get course lessons with caching
const getCourseLessons = async (req, res) => {
  const { courseId } = req.params;
  const cacheKey = `courseLessons_${courseId}`; // Unique key for caching

  try {
    const cachedLessons = await getAsync(cacheKey);
    if (cachedLessons) {
      logger.info(`Serving lessons for course ${courseId} from cache`);
      return res.status(200).json(JSON.parse(cachedLessons));
    }

    const course = await Course.findById(courseId).populate("lessons");
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const courseWithLessons = {
      _id: course._id,
      title: course.title,
      description: course.description,
      createdBy: course.createdBy,
      lessons: course.lessons,
    };

    await setAsync(cacheKey, JSON.stringify(courseWithLessons), 'EX', 600);
    logger.info(`Serving lessons for course ${courseId} from database and caching result`);
    res.status(200).json(courseWithLessons);
  } catch (error) {
    logger.error(`Error fetching lessons for course ${courseId}: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  uploadCourseMaterial,
  createLesson,
  updateLesson,
  deleteLesson,
  getLesson,
  getCourseLessons,
};
