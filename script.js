// ===========================================
// DATA PEGAWAI & PENGISI TABEL (DENGAN CUSTOM SORTING)
// ===========================================

const tableBody = document.getElementById("pegawai-list");
let employeeDataGlobal = []; // Variabel global untuk menyimpan data
let sortDirection = {}; // Menyimpan arah pengurutan per kolom

// 🚨 DEFINISI URUTAN JABATAN KUSTOM ANDA
// MOHON SESUAIKAN DAFTAR INI DENGAN JABATAN AKTUAL DI FILE JSON ANDA, DARI YANG TERTINGGI KE TERENDAH.
const CUSTOM_ORDER_JABATAN = [
  "Kepala BPS Kota Jakarta Barat",
  "Kepala Sub Bagian Umum",
  "Statistisi Ahli Muda",
  "Prakom Ahli Muda",
  "Statistisi Ahli Pertama",
  "Prakom Ahli Pertama",
  "Statistisi Terampil",
  "Pranata Keuangan APBN Terampil",
  "Statistisi Penyelia",
  "Statistisi Pelaksana Lanjutan",
  "Statistisi Pelaksana",
  "Staf",
];

// MAPPING Kunci JSON ke Indeks Kolom Tabel
const columnMapping = {
  0: "nama",
  1: "nipLama",
  2: "nipBaru",
  3: "email",
  4: "jeniskelamin",
  5: "pendidikan",
  6: "pangkat",
  7: "jabatan", // Kolom ke-8 (Target Custom Sort)
};

async function loadPegawaiData() {
  try {
    const response = await fetch("data_pegawai.json");
    if (!response.ok) {
      throw new Error(`Gagal mengambil data: ${response.status}`);
    }

    employeeDataGlobal = await response.json(); // Simpan data global

    // 🔹 Urutkan dulu berdasarkan jabatan (mengikuti CUSTOM_ORDER_JABATAN)
    employeeDataGlobal.sort((a, b) => {
      const indexA = CUSTOM_ORDER_JABATAN.indexOf(a.jabatan);
      const indexB = CUSTOM_ORDER_JABATAN.indexOf(b.jabatan);
      const rankA = indexA === -1 ? CUSTOM_ORDER_JABATAN.length : indexA;
      const rankB = indexB === -1 ? CUSTOM_ORDER_JABATAN.length : indexB;

      if (rankA !== rankB) return rankA - rankB;
      return a.nama.localeCompare(b.nama); // Jika jabatan sama, urutkan nama
    });

    renderTable(employeeDataGlobal);
    renderDashboard(employeeDataGlobal);
    initSorting(); // Inisialisasi klik sorting
    initCarousel(employeeDataGlobal.length);
  } catch (error) {
    console.error("Terjadi kesalahan saat memuat data:", error);
    tableBody.innerHTML =
      '<tr><td colspan="8">Gagal memuat data pegawai. Pastikan file data_pegawai.json ada dan isinya benar.</td></tr>';
  }
}

function renderTable(data) {
  tableBody.innerHTML = ""; // Bersihkan konten tabel lama

  data.forEach((pegawai) => {
    const row = tableBody.insertRow();

    // 1. Nama Pegawai (Kolom Freeze)
    const namaCell = row.insertCell();
    namaCell.textContent = pegawai.nama;
    namaCell.classList.add("freeze-col"); // Class untuk freezing

    // Kolom 2 - 8:
    row.insertCell().textContent = pegawai.nipLama;
    row.insertCell().textContent = pegawai.nipBaru;
    row.insertCell().textContent = pegawai.email;
    row.insertCell().textContent = pegawai.jeniskelamin || "-";
    row.insertCell().textContent = pegawai.pendidikan || "-";
    row.insertCell().textContent = pegawai.pangkat;
    row.insertCell().textContent = pegawai.jabatan;
  });
}

// ===========================================
// FUNGSI DASHBOARD (TOTAL, JABATAN, PENDIDIKAN)
// ===========================================
function renderDashboard(data) {
  // 🔹 TOTAL PEGAWAI
  document.getElementById("totalPegawai").textContent = data.length;

  // 🔹 JABATAN FUNGSIONAL
  const jabatanFungsional = [
    "Kepala Sub Bagian Umum",
    "Statistisi Ahli Muda",
    "Prakom Ahli Muda",
    "Statistisi Ahli Pertama",
    "Prakom Ahli Pertama",
    "Statistisi Terampil",
    "Pranata Keuangan APBN Terampil",
    "Statistisi Penyelia",
    "Statistisi Pelaksana Lanjutan",
    "Statistisi Pelaksana",
    "Staf",
  ];

  const jabatanGrid = document.getElementById("jabatanFungsional");
  jabatanGrid.innerHTML = "";

  jabatanFungsional.forEach((j) => {
    const count = data.filter((p) =>
      p.jabatan.toLowerCase().includes(j.toLowerCase())
    ).length;
    const div = document.createElement("div");
    div.classList.add("jabatan-item");
    div.innerHTML = `<span>${j}</span><strong>${count}</strong>`;
    jabatanGrid.appendChild(div);
  });

  // 🔹 PENDIDIKAN
  const pendidikanCounts = { SLTA: 0, "D-III": 0, "S-2": 0, "D-IV / S-1": 0 };
  data.forEach((p) => {
    const pend = (p.pendidikan || "").toUpperCase();
    if (pend.includes("S2") || pend.includes("S-2")) pendidikanCounts["S-2"]++;
    else if (pend.includes("D3") || pend.includes("D-III"))
      pendidikanCounts["D-III"]++;
    else if (
      pend.includes("S1") ||
      pend.includes("D4") ||
      pend.includes("D-IV")
    )
      pendidikanCounts["D-IV / S-1"]++;
    else pendidikanCounts["SLTA"]++;
  });

  const totalPendidikan = Object.values(pendidikanCounts).reduce(
    (a, b) => a + b,
    0
  );

  // Tampilkan data pendidikan
  const pendDiv = document.getElementById("pendidikanData");
  pendDiv.innerHTML = Object.entries(pendidikanCounts)
    .map(([k, v]) => `<div><span>${k}</span><strong>${v}</strong></div>`)
    .join("");

  // Chart pendidikan
  new Chart(document.getElementById("chartPendidikan"), {
    type: "pie",
    data: {
      labels: Object.keys(pendidikanCounts),
      datasets: [
        {
          data: Object.values(pendidikanCounts),
          backgroundColor: ["#305f90", "#f8b4d9", "#c9134f", "#efefef"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            boxWidth: 10,
            padding: 15,
            font: {
              size: 13,
              family: "Arial, sans-serif",
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${ctx.parsed}`,
          },
        },
      },
    },
  });

  // 🔹 JENIS KELAMIN
  const genderCounts = { Laki: 0, Perempuan: 0 };
  data.forEach((p) => {
    if ((p.jeniskelamin || "").toLowerCase().includes("laki"))
      genderCounts.Laki++;
    else if ((p.jeniskelamin || "").toLowerCase().includes("perempuan"))
      genderCounts.Perempuan++;
  });

  new Chart(document.getElementById("chartJenisKelamin"), {
    type: "doughnut",
    data: {
      labels: Object.keys(genderCounts),
      datasets: [
        {
          data: Object.values(genderCounts),
          backgroundColor: ["#4285f4", "#f77cb5"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            boxWidth: 10,
            padding: 15,
            font: {
              size: 13,
              family: "Arial, sans-serif",
            },
            color: "#333",
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${ctx.parsed}`,
          },
        },
      },
      layout: {
        padding: { bottom: 10 },
      },
    },
  });
}

function initSorting() {
  const headers = document.querySelectorAll("#employee-table thead th");
  headers.forEach((header, index) => {
    const key = columnMapping[index];
    if (!key) return;

    header.style.cursor = "pointer";
    header.setAttribute("data-column-index", index);

    header.addEventListener("click", () => {
      sortTable(key);
    });
  });
}

function sortTable(key) {
  let currentDirection = sortDirection[key] || "asc";
  let newDirection = currentDirection === "asc" ? "desc" : "asc";

  employeeDataGlobal.sort((a, b) => {
    let comparison = 0;

    // 🚨 LOGIKA CUSTOM SORTING KHUSUS JABATAN
    if (key === "jabatan") {
      // Dapatkan index/peringkat jabatan
      const indexA = CUSTOM_ORDER_JABATAN.indexOf(a[key]);
      const indexB = CUSTOM_ORDER_JABATAN.indexOf(b[key]);

      // Atur jabatan yang tidak terdaftar ke peringkat terendah (akhir daftar)
      const rankA = indexA === -1 ? CUSTOM_ORDER_JABATAN.length : indexA;
      const rankB = indexB === -1 ? CUSTOM_ORDER_JABATAN.length : indexB;

      // Bandingkan peringkat
      comparison = rankA - rankB;

      // Jika jabatannya sama, gunakan nama sebagai pembanding sekunder
      if (comparison === 0) {
        comparison = a.nama.localeCompare(b.nama);
      }
    }
    // Logika Sorting Standar (Nama, NIP, dll.)
    else {
      let valA = (a[key] || "").toString().toLowerCase();
      let valB = (b[key] || "").toString().toLowerCase();

      // Sorting Angka (NIP, Pangkat)
      if (
        (key.includes("nip") || key.includes("pangkat")) &&
        !isNaN(a[key]) &&
        !isNaN(b[key])
      ) {
        valA = Number(a[key]);
        valB = Number(b[key]);
        comparison = valA - valB;
      } else {
        // Sorting Teks (Nama, Email, dll.)
        comparison = valA.localeCompare(valB);
      }
    }

    // Balikkan hasil jika arahnya 'desc'
    return newDirection === "asc" ? comparison : comparison * -1;
  });

  sortDirection[key] = newDirection;
  renderTable(employeeDataGlobal);
  updateSortIndicators(key, newDirection);
}

function updateSortIndicators(sortedKey, direction) {
  const headers = document.querySelectorAll("#employee-table thead th");
  headers.forEach((header) => {
    const index = header.getAttribute("data-column-index");
    const key = columnMapping[index];

    let indicator = header.querySelector(".sort-indicator");
    if (!indicator) {
      indicator = document.createElement("span");
      indicator.classList.add("sort-indicator");
      header.appendChild(indicator);
    }

    indicator.textContent = "";

    if (key === sortedKey) {
      indicator.textContent = direction === "asc" ? " ▲" : " ▼";
    }
  });
}

// ===========================================
// KODE CAROUSEL DAN RESPONSIF — VERSI PERBAIKAN (1 DOT = 1 FOTO)
// ===========================================
const carouselContainer = document.querySelector(".carousel-container");
const dotsContainer = document.querySelector(".carousel-dots");
const SLIDE_DELAY = 1500;

let totalPhotos = 0;
let autoSlideInterval = null;
let startIndex = 0;

function getCarouselConfig() {
  const isMobile = window.innerWidth <= 768;
  const VISIBLE_COUNT = isMobile ? 3 : 5;
  const centerIndexOffset = Math.floor(VISIBLE_COUNT / 2);

  // ✳️ Sekarang: 1 dot per foto — sehingga setiap foto bisa jadi pusat
  const totalDots = Math.max(1, totalPhotos);

  return {
    VISIBLE_COUNT,
    centerIndexOffset,
    totalDots,
  };
}

function createPhotoList(count) {
  carouselContainer.innerHTML = "";
  for (let i = 1; i <= count; i++) {
    const file = `img/foto${i}.jpg`;
    const slide = document.createElement("div");
    slide.classList.add("slide");
    slide.innerHTML = `<img src="${file}" alt="Foto Pegawai ${i}">`;
    carouselContainer.appendChild(slide);
  }
}

function createDots() {
  dotsContainer.innerHTML = "";
  const { totalDots } = getCarouselConfig();

  for (let i = 0; i < totalDots; i++) {
    const dot = document.createElement("span");
    dot.classList.add("dot");
    dot.setAttribute("data-index", i);
    dot.addEventListener("click", () => updateCarousel(i));
    dotsContainer.appendChild(dot);
  }
}

function startAutoSlide() {
  clearInterval(autoSlideInterval);
  const { totalDots } = getCarouselConfig();

  autoSlideInterval = setInterval(() => {
    let nextIndex = startIndex + 1;
    if (nextIndex >= totalDots) nextIndex = 0;
    updateCarousel(nextIndex);
  }, SLIDE_DELAY);
}

function initCarousel(count) {
  totalPhotos = count;
  const { VISIBLE_COUNT } = getCarouselConfig();

  // Jika jumlah foto <= yang terlihat, cukup tampilkan tanpa mekanik centering
  if (totalPhotos <= VISIBLE_COUNT) {
    document.getElementById("photo-slideshow").style.overflow = "auto";
    createPhotoList(totalPhotos);
    // opsional: sembunyikan dots jika ingin
    dotsContainer.innerHTML = "";
    return;
  }

  createPhotoList(totalPhotos);
  createDots();

  startIndex = 0;
  updateCarousel(0);
  startAutoSlide();
}

function updateCarousel(newStartIndex) {
  if (totalPhotos === 0) return;

  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");
  if (!slides.length) return;

  const isManualShift = newStartIndex !== startIndex;

  // jaga index
  if (newStartIndex < 0) newStartIndex = 0;
  else if (newStartIndex >= totalPhotos) newStartIndex = totalPhotos - 1;
  startIndex = newStartIndex;

  // ukuran
  const wrapper = document.querySelector("#photo-slideshow");
  const wrapperWidth = wrapper.offsetWidth;
  const slideWidth = slides[0].offsetWidth || 150;
  const style = window.getComputedStyle(slides[0]);
  const slideMargin =
    (parseFloat(style.marginLeft) || 0) + (parseFloat(style.marginRight) || 0);
  const slideWidthWithMargin = slideWidth + slideMargin;

  // pusatkan selalu foto aktif
  const centerAdjustment = wrapperWidth / 2 - slideWidth / 2;
  const finalShift = centerAdjustment - startIndex * slideWidthWithMargin;

  // terapkan tanpa batasan kiri/kanan
  carouselContainer.style.transform = `translateX(${finalShift}px)`;

  // efek aktif
  slides.forEach((s) => s.classList.remove("active"));
  if (slides[startIndex]) slides[startIndex].classList.add("active");

  // titik navigasi
  dots.forEach((d) => d.classList.remove("active"));
  if (dots[startIndex]) dots[startIndex].classList.add("active");

  if (isManualShift) startAutoSlide();
}

// resize: re-init tapi jangan spam
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (totalPhotos > 0) initCarousel(totalPhotos);
  }, 200);
});

document.addEventListener("DOMContentLoaded", loadPegawaiData);
