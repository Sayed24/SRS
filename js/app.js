
(() => {
  "use strict";


  /* =====================================================
     STORAGE
  ===================================================== */

  const STORAGE_KEY = "mongoui_records_v1";

  const ACTIVITY_KEY = "mongoui_activity_v1";

  const THEME_KEY = "mongoui_theme_v1";


  /* =====================================================
     DEMO DATA
  ===================================================== */

  const seed = [

    {
      id: "REC-1001",
      name: "Alex Morgan",
      email: "alex.morgan@example.com",
      category: "Customer",
      status: "Active",
      notes: "Primary customer account.",
      updatedAt: Date.now() - 1000 * 60 * 18
    },

    {
      id: "REC-1002",
      name: "Jordan Lee",
      email: "jordan.lee@example.com",
      category: "Project",
      status: "Active",
      notes: "Project contact.",
      updatedAt: Date.now() - 1000 * 60 * 72
    },

    {
      id: "REC-1003",
      name: "Taylor Smith",
      email: "taylor.smith@example.com",
      category: "Lead",
      status: "Inactive",
      notes: "Follow-up required.",
      updatedAt: Date.now() - 1000 * 60 * 60 * 20
    },

    {
      id: "REC-1004",
      name: "Morgan Davis",
      email: "morgan.davis@example.com",
      category: "Employee",
      status: "Active",
      notes: "Internal employee record.",
      updatedAt: Date.now() - 1000 * 60 * 60 * 28
    }

  ];


  /* =====================================================
     STATE
  ===================================================== */

  let records = load(STORAGE_KEY, null);

  let activities = load(ACTIVITY_KEY, []);


  if (!records) {

    records = seed;

    save(STORAGE_KEY, records);

  }


  /* =====================================================
     HELPERS
  ===================================================== */

  const $ = selector => {
    return document.querySelector(selector);
  };


  const $$ = selector => {
    return [...document.querySelectorAll(selector)];
  };


  function load(key, fallback) {

    try {

      const value = localStorage.getItem(key);

      return value
        ? JSON.parse(value)
        : fallback;

    } catch {

      return fallback;

    }

  }


  function save(key, value) {

    localStorage.setItem(
      key,
      JSON.stringify(value)
    );

  }


  /* =====================================================
     SECURITY / HTML ESCAPING
  ===================================================== */

  function escapeHTML(value = "") {

    return String(value).replace(
      /[&<>"']/g,
      character => {

        const entities = {

          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"

        };

        return entities[character];

      }
    );

  }


  /* =====================================================
     RECORD HELPERS
  ===================================================== */

  function initials(name) {

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(word => word[0])
      .join("")
      .toUpperCase();

  }


  function formatDate(timestamp) {

    const date = new Date(timestamp);

    return date.toLocaleDateString(
      undefined,
      {
        month: "short",
        day: "numeric",
        year: "numeric"
      }
    );

  }


  function relative(timestamp) {

    const minutes = Math.max(
      1,
      Math.floor(
        (Date.now() - timestamp) / 60000
      )
    );


    if (minutes < 60) {

      return `${minutes}m ago`;

    }


    const hours = Math.floor(
      minutes / 60
    );


    if (hours < 24) {

      return `${hours}h ago`;

    }


    const days = Math.floor(
      hours / 24
    );


    return `${days}d ago`;

  }


  function nextId() {

    return (
      "REC-" +
      (1000 + Math.floor(Math.random() * 8999))
    );

  }


  /* =====================================================
     ACTIVITY
  ===================================================== */

  function addActivity(
    action,
    recordName
  ) {

    activities.unshift({

      action,

      recordName,

      at: Date.now()

    });


    activities = activities.slice(
      0,
      50
    );


    save(
      ACTIVITY_KEY,
      activities
    );

  }


  /* =====================================================
     RENDER EVERYTHING
  ===================================================== */

  function render() {

    renderStats();

    renderCategories();

    renderRecent();

    renderRecords();

    renderActivity();

  }


  /* =====================================================
     STATISTICS
  ===================================================== */

  function renderStats() {

    $("#statTotal").textContent =
      records.length;


    $("#statActive").textContent =
      records.filter(
        record =>
          record.status === "Active"
      ).length;


    $("#statCategories").textContent =
      new Set(
        records.map(
          record => record.category
        )
      ).size;


    if (records.length) {

      $("#statUpdated").textContent =
        relative(
          Math.max(
            ...records.map(
              record => record.updatedAt
            )
          )
        );

    } else {

      $("#statUpdated").textContent =
        "—";

    }

  }


  /* =====================================================
     TABLE ROW
  ===================================================== */

  function row(record) {

    return `

      <tr>

        <td>

          <div class="record-cell">

            <div class="record-avatar">
              ${escapeHTML(
                initials(record.name)
              )}
            </div>

            <div>

              <span class="record-name">
                ${escapeHTML(
                  record.name
                )}
              </span>

              <small class="record-id">
                ${escapeHTML(
                  record.id
                )}
              </small>

            </div>

          </div>

        </td>


        <td>
          ${escapeHTML(
            record.email
          )}
        </td>


        <td class="category">
          ${escapeHTML(
            record.category
          )}
        </td>


        <td>

          <span
            class="badge ${record.status.toLowerCase()}"
          >

            ${escapeHTML(
              record.status
            )}

          </span>

        </td>


        <td>
          ${formatDate(
            record.updatedAt
          )}
        </td>


        <td>

          <div class="row-actions">

            <button
              class="mini-btn"
              data-action="edit"
              data-id="${record.id}"
              title="Edit"
            >
              ✎
            </button>


            <button
              class="mini-btn delete"
              data-action="delete"
              data-id="${record.id}"
              title="Delete"
            >
              ⌫
            </button>

          </div>

        </td>

      </tr>

    `;

  }


  /* =====================================================
     RECENT RECORDS
  ===================================================== */

  function renderRecent() {

    const list = [
      ...records
    ]
      .sort(
        (a, b) =>
          b.updatedAt - a.updatedAt
      )
      .slice(0, 5);


    $("#recentTable").innerHTML =
      list
        .map(row)
        .join("");


    $("#recentEmpty").classList.toggle(
      "hidden",
      list.length !== 0
    );

  }


  /* =====================================================
     CATEGORIES
  ===================================================== */

  function renderCategories() {

    const select =
      $("#categoryFilter");


    const current =
      select.value;


    const categories = [
      ...new Set(
        records.map(
          record => record.category
        )
      )
    ].sort();


    select.innerHTML = `

      <option value="">
        All categories
      </option>

      ${categories
        .map(
          category => `

            <option
              value="${escapeHTML(category)}"
            >
              ${escapeHTML(category)}
            </option>

          `
        )
        .join("")}

    `;


    if (
      categories.includes(current)
    ) {

      select.value = current;

    }

  }


  /* =====================================================
     RECORDS TABLE
  ===================================================== */

  function renderRecords() {

    const search =
      $("#searchInput")
        .value
        .trim()
        .toLowerCase();


    const category =
      $("#categoryFilter").value;


    const status =
      $("#statusFilter").value;


    const filtered =
      records
        .filter(record => {

          const searchable = `

            ${record.name}

            ${record.email}

            ${record.category}

            ${record.id}

            ${record.notes}

          `.toLowerCase();


          return (

            (!search ||
              searchable.includes(search))

            &&

            (!category ||
              record.category === category)

            &&

            (!status ||
              record.status === status)

          );

        })

        .sort(
          (a, b) =>
            b.updatedAt - a.updatedAt
        );


    $("#recordsTable").innerHTML =
      filtered
        .map(row)
        .join("");


    $("#recordsEmpty").classList.toggle(
      "hidden",
      filtered.length !== 0
    );


    $("#recordCount").textContent =

      `${filtered.length} record${
        filtered.length === 1
          ? ""
          : "s"
      }`;

  }


  /* =====================================================
     ACTIVITY
  ===================================================== */

  function renderActivity() {

    const list =
      $("#activityList");


    if (!activities.length) {

      list.innerHTML = `

        <div class="empty-state">

          No activity yet.

        </div>

      `;

      return;

    }


    list.innerHTML =
      activities
        .map(activity => `

          <div class="activity-item">

            <div class="activity-icon">
              ✓
            </div>


            <div>

              <b>
                ${escapeHTML(
                  activity.action
                )}
              </b>

              <p>
                ${escapeHTML(
                  activity.recordName
                )}
              </p>

            </div>


            <span class="activity-time">

              ${relative(
                activity.at
              )}

            </span>

          </div>

        `)
        .join("");

  }


  /* =====================================================
     OPEN MODAL
  ===================================================== */

  function openModal(record = null) {

    $("#recordForm").reset();


    $("#recordId").value =
      record?.id || "";


    $("#name").value =
      record?.name || "";


    $("#email").value =
      record?.email || "";


    $("#category").value =
      record?.category ||
      "Customer";


    $("#status").value =
      record?.status ||
      "Active";


    $("#notes").value =
      record?.notes || "";


    $("#modalEyebrow").textContent =
      record
        ? "EDIT DOCUMENT"
        : "NEW DOCUMENT";


    $("#modalTitle").textContent =
      record
        ? "Edit record"
        : "Create record";


    $("#saveBtn").textContent =
      record
        ? "Save changes"
        : "Create record";


    $("#formError")
      .classList
      .add("hidden");


    $("#modalBackdrop")
      .classList
      .remove("hidden");


    setTimeout(
      () => $("#name").focus(),
      50
    );

  }


  /* =====================================================
     CLOSE MODAL
  ===================================================== */

  function closeModal() {

    $("#modalBackdrop")
      .classList
      .add("hidden");

  }


  /* =====================================================
     CREATE / UPDATE
  ===================================================== */

  function submitRecord(event) {

    event.preventDefault();


    const id =
      $("#recordId").value;


    const name =
      $("#name")
        .value
        .trim();


    const email =
      $("#email")
        .value
        .trim();


    if (!name || !email) {

      $("#formError").textContent =
        "Name and email are required.";


      $("#formError")
        .classList
        .remove("hidden");


      return;

    }


    const now = Date.now();


    const data = {

      id:
        id || nextId(),

      name,

      email,

      category:
        $("#category").value,

      status:
        $("#status").value,

      notes:
        $("#notes")
          .value
          .trim(),

      updatedAt:
        now

    };


    /* UPDATE */

    if (id) {

      const index =
        records.findIndex(
          record =>
            record.id === id
        );


      if (index >= 0) {

        records[index] =
          data;

      }


      addActivity(
        "Updated record",
        name
      );


      toast(
        "Record updated"
      );

    }


    /* CREATE */

    else {

      records.push(data);


      addActivity(
        "Created record",
        name
      );


      toast(
        "Record created"
      );

    }


    save(
      STORAGE_KEY,
      records
    );


    closeModal();

    render();

  }


  /* =====================================================
     DELETE
  ===================================================== */

  function deleteRecord(id) {

    const record =
      records.find(
        item =>
          item.id === id
      );


    if (!record) {
      return;
    }


    const confirmed =
      confirm(
        `Delete "${record.name}"? This cannot be undone.`
      );


    if (!confirmed) {
      return;
    }


    records =
      records.filter(
        item =>
          item.id !== id
      );


    addActivity(
      "Deleted record",
      record.name
    );


    save(
      STORAGE_KEY,
      records
    );


    render();


    toast(
      "Record deleted"
    );

  }


  /* =====================================================
     EXPORT JSON
  ===================================================== */

  function exportJSON() {

    const blob =
      new Blob(
        [
          JSON.stringify(
            records,
            null,
            2
          )
        ],
        {
          type:
            "application/json"
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );


    link.href = url;

    link.download =
      "mongoui-records.json";


    link.click();


    URL.revokeObjectURL(
      url
    );


    toast(
      "JSON exported"
    );

  }


  /* =====================================================
     TOAST
  ===================================================== */

  function toast(message) {

    const element =
      document.createElement(
        "div"
      );


    element.className =
      "toast";


    element.textContent =
      message;


    $("#toastContainer")
      .appendChild(
        element
      );


    setTimeout(
      () => element.remove(),
      2800
    );

  }


  /* =====================================================
     CHANGE VIEW
  ===================================================== */

  function setView(view) {

    $$(".view")
      .forEach(element => {

        element.classList.remove(
          "active"
        );

      });


    $(`#${view}View`)
      .classList
      .add("active");


    $$(".nav-item[data-view]")
      .forEach(button => {

        button.classList.toggle(
          "active",
          button.dataset.view === view
        );

      });


    $("#pageTitle").textContent =
      view.charAt(0).toUpperCase() +
      view.slice(1);


    $("#sidebar")
      .classList
      .remove("open");


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }


  /* =====================================================
     NAVIGATION
  ===================================================== */

  $$(".nav-item[data-view]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () =>
          setView(
            button.dataset.view
          )
      );

    });


  $$(".text-btn[data-view]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () =>
          setView(
            button.dataset.view
          )
      );

    });


  /* =====================================================
     MOBILE MENU
  ===================================================== */

  $("#menuBtn")
    .addEventListener(
      "click",
      () => {

        $("#sidebar")
          .classList
          .toggle("open");

      }
    );


  /* =====================================================
     CREATE BUTTONS
  ===================================================== */

  $("#heroAddBtn")
    .addEventListener(
      "click",
      () =>
        openModal()
    );


  $("#addBtn")
    .addEventListener(
      "click",
      () =>
        openModal()
    );


  /* =====================================================
     MODAL CONTROLS
  ===================================================== */

  $("#closeModal")
    .addEventListener(
      "click",
      closeModal
    );


  $("#cancelBtn")
    .addEventListener(
      "click",
      closeModal
    );


  $("#recordForm")
    .addEventListener(
      "submit",
      submitRecord
    );


  $("#modalBackdrop")
    .addEventListener(
      "click",
      event => {

        if (
          event.target.id ===
          "modalBackdrop"
        ) {

          closeModal();

        }

      }
    );


  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape"
      ) {

        closeModal();

      }

    }
  );


  /* =====================================================
     FILTERS
  ===================================================== */

  [
    "searchInput",
    "categoryFilter",
    "statusFilter"
  ].forEach(id => {

    $("#" + id)
      .addEventListener(
        "input",
        renderRecords
      );

  });


  /* =====================================================
     CLEAR FILTERS
  ===================================================== */

  $("#clearBtn")
    .addEventListener(
      "click",
      () => {

        $("#searchInput").value =
          "";

        $("#categoryFilter").value =
          "";

        $("#statusFilter").value =
          "";

        renderRecords();

      }
    );


  /* =====================================================
     EDIT / DELETE ACTIONS
  ===================================================== */

  document.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          "[data-action]"
        );


      if (!button) {
        return;
      }


      const record =
        records.find(
          item =>
            item.id ===
            button.dataset.id
        );


      if (
        button.dataset.action ===
          "edit" &&
        record
      ) {

        openModal(record);

      }


      if (
        button.dataset.action ===
        "delete"
      ) {

        deleteRecord(
          button.dataset.id
        );

      }

    }
  );


  /* =====================================================
     THEME
  ===================================================== */

  const savedTheme =
    localStorage.getItem(
      THEME_KEY
    );


  if (
    savedTheme === "dark"
  ) {

    document.body
      .classList
      .add("dark");

  }


  $("#themeToggle")
    .addEventListener(
      "click",
      () => {

        document.body
          .classList
          .toggle("dark");


        localStorage.setItem(
          THEME_KEY,
          document.body.classList.contains(
            "dark"
          )
            ? "dark"
            : "light"
        );

      }
    );


  /* =====================================================
     EXPORT
  ===================================================== */

  $("#exportBtn")
    .addEventListener(
      "click",
      exportJSON
    );


  /* =====================================================
     REFRESH
  ===================================================== */

  $("#refreshBtn")
    .addEventListener(
      "click",
      () => {

        render();

        toast(
          "Data refreshed"
        );

      }
    );


  /* =====================================================
     INITIAL RENDER
  ===================================================== */

  render();

})();
