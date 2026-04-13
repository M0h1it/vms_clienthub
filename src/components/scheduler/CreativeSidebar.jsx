import { useRef, useEffect, useState } from "react";
import { Draggable } from "@fullcalendar/interaction";
import {
  FaImages,
  FaSearch,
  FaVideo,
  FaRegFileImage
} from "react-icons/fa";

const SERVER_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace("/api", "");
const getCreativeUrl = (path) => {
  if (!path) return "";

  let cleanPath = path
    .replace(/^\/+/, "")
    .replace(/\\/g, "/");

  // 🔥 Fix old + new data both
  if (!cleanPath.startsWith("uploads/")) {
    cleanPath = `uploads/creatives/${cleanPath}`;
  }

  return `${SERVER_BASE}/${cleanPath}`;
};

export default function CreativeSidebar({ creatives }) {

  const dragRef = useRef();
  const [search, setSearch] = useState("");

  useEffect(() => {

    if (!dragRef.current) return;

    const draggable = new Draggable(dragRef.current, {

      itemSelector: ".creative-item",

     eventData: (el) => ({
  title: el.dataset.title,
  extendedProps: {
    creativeId: Number(el.dataset.id),
    type: el.dataset.type,
    duration: Number(el.dataset.duration) // ✅ real duration
  }
})

    });

    return () => draggable.destroy();

  }, []);

  const filtered = creatives.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (

    <div className="creative-sidebar card shadow-sm border-0">

      {/* HEADER */}

      <div className="card-header bg-white fw-bold d-flex align-items-center gap-2">

        <FaImages />
        Creative Library

      </div>

      {/* SEARCH */}

      <div className="p-2 border-bottom">

        <div className="input-group input-group-sm">

          <span className="input-group-text bg-white">
            <FaSearch />
          </span>

          <input
            className="form-control"
            placeholder="Search creatives..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

      </div>

      {/* LIST */}

      <div className="creative-list p-2" ref={dragRef}>

        {filtered.length === 0 ? (

          <div className="text-center py-4 text-muted small">
            No creatives found
          </div>

        ) : (

          filtered.map(c => {

            const url = getCreativeUrl(c.media_url);

            return (

              <div
                key={c.id}
                className="creative-item d-flex align-items-center gap-2 p-2 mb-2 rounded"
                data-id={c.id}
                data-title={c.title}
                data-type={c.type}
  data-duration={c.duration}
              >

                {/* THUMBNAIL */}

                <div className="creative-thumb">

                  {c.type === "video" ? (

                    <video src={url} muted />

                  ) : (

                    <img src={url} alt={c.title} />

                  )}

                </div>

                {/* TITLE */}

                <div className="flex-grow-1">

                  <div className="fw-semibold small text-truncate">

                    {c.title}

                  </div>

                  <div className="small text-muted d-flex align-items-center gap-1">

                    {c.type === "video"
                      ? <FaVideo size={10} />
                      : <FaRegFileImage size={10} />
                    }

                    {c.type}

                  </div>

                </div>

              </div>

            );

          })

        )}

      </div>

      <style>{`

      .creative-sidebar{
        height:calc(100vh - 160px);
        display:flex;
        flex-direction:column;
      }

      .creative-list{
        overflow-y:auto;
        flex:1;
      }

      .creative-item{
        background:#f8f9fc;
        cursor:grab;
        transition:all .2s ease;
      }

      .creative-item:hover{
        background:#eef2ff;
        transform:translateX(3px);
      }

      .creative-thumb{
        width:48px;
        height:36px;
        border-radius:6px;
        overflow:hidden;
        flex-shrink:0;
      }

      .creative-thumb img,
      .creative-thumb video{
        width:100%;
        height:100%;
        object-fit:cover;
      }

      `}</style>

    </div>

  );

}