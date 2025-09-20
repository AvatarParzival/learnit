import React from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import CourseCard from "./catalog/CourseCard";

const PAGE_SIZE = 12;

export default function CourseList() {
  const [params, setParams] = useSearchParams();
  const [courses, setCourses] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const page = Number(params.get("page") || 1);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(params);
      if (!query.get("page")) query.set("page", String(page));
      if (!query.get("pageSize")) query.set("pageSize", String(PAGE_SIZE));

      const res = await axios.get(`/api/courses?${query.toString()}`);
      const body = res.data;

      if (Array.isArray(body)) {
        setCourses(body.slice(0, PAGE_SIZE));
        setTotal(body.length);
      } else {
        setCourses(body.items || []);
        setTotal(body.total ?? (body.items ? body.items.length : 0));
      }
    } catch (e) {
      setCourses([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [params, page]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const onPage = (p) => {
    const next = new URLSearchParams(params);
    next.set("page", String(p));
    setParams(next);
  };

  const skeletons = React.useMemo(() => Array.from({ length: 12 }), []);

  return (
    <div className="py-4">
      <h1 className="h3 fw-bold mb-3">All courses</h1>
      <div className="row g-4">
        <div className="col-lg-3">
          <FiltersSidebar />
        </div>

        <div className="col-lg-9">
          <SortBar total={total} />
          <div className="row g-3 mt-2">
            {loading ? (
              skeletons.map((_, i) => (
                <div className="col-12 col-md-6 col-xl-4" key={i}>
                  <div className="skel">
                    <div className="ph-img" />
                    <div className="p-3">
                      <div className="placeholder-glow">
                        <span className="placeholder col-10"></span>
                        <span className="placeholder col-8"></span>
                        <span className="placeholder col-6"></span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : courses.length ? (
              courses.map((course) => (
                <div className="col-12 col-md-6 col-xl-4" key={course._id}>
                  <CourseCard course={course} />
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="p-4 border rounded text-center">
                  <div className="fw-semibold">No courses found</div>
                  <div className="text-muted small">
                    Try different filters or search terms.
                  </div>
                </div>
              </div>
            )}
          </div>

          <Pagination page={page} totalPages={totalPages} onPage={onPage} />
        </div>
      </div>
    </div>
  );
}