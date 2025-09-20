import React from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import VideoPlayer from "../components/VideoPlayer";

export default function CourseDetail(){
  const { id } = useParams();
  const [course, setCourse] = React.useState(null);

  React.useEffect(()=>{
    axios.get(`/courses/${id}`).then(res=>setCourse(res.data));
  },[id]);

  if(!course) return <div className="py-5">Loading...</div>;

  return (
    <div className="py-4">
      <div className="row g-4">
        <div className="col-lg-8">
          <h1 className="fw-bold">{course.title}</h1>
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="small text-muted"> • {course.students || "15,432"} students</span>
          </div>
          <div className="small text-muted mb-3">Created by {course.instructor || "Top Instructor"}</div>
          <div className="mb-3">
            <VideoPlayer videoUrl={course.promoVideo || course.video_url} poster={course.image} />
          </div>
          <h5>What you'll learn</h5>
          <ul>
            {(course.learn || ["Build real projects","Master fundamentals","Best practices"]).map((l,i)=><li key={i}>{l}</li>)}
          </ul>
          <h5 className="mt-4">Description</h5>
          <p>{course.description}</p>
        </div>
        <div className="col-lg-4">
          <div className="p-3 border rounded">
            <div className="display-6 fw-bold mb-2">${Number(course.price || 19.99).toFixed(2)}</div>
            <button className="btn btn-dark w-100">Add to cart</button>
            <button className="btn btn-outline-dark w-100 mt-2">Buy now</button>
            <div className="small text-muted mt-3">30-Day Money-Back Guarantee</div>
            <hr/>
            <div className="small">
              <div><i className="fa-regular fa-circle-play me-2"/> {course.duration || "8.5"} hours on-demand video</div>
              <div><i className="fa-regular fa-file-lines me-2"/> {course.articles || 10} articles</div>
              <div><i className="fa-regular fa-infinity me-2"/> Full lifetime access</div>
              <div><i className="fa-solid fa-trophy me-2"/> Certificate of completion</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}