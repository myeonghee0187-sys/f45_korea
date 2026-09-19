(function () {
  "use strict";

  // Source: the six branch records supplied for this portfolio and shown on Home.
  // Do not infer operating hours, facilities, schedules or branch-specific photos.
  window.F45Branches = Object.freeze([
    { slug: "gyodae", name: "F45 교대", address: "서초대로51길 24 2,3층", phone: "0507-1334-6376" },
    { slug: "yeoksam", name: "F45 역삼", address: "테헤란로14길 13 지하 1층", phone: "0507-1391-1451" },
    { slug: "sinsa", name: "F45 신사", address: "도산대로 120 청호빌딩 지하 1층", phone: "0507-1334-6376" },
    { slug: "cheongdam", name: "F45 청담", address: "도산대로 413 고영캠퍼스 지하 2층", phone: "0507-1421-0649" },
    { slug: "gangnam", name: "F45 강남", address: "테헤란로84길 14 지하 1층", phone: "0507-1444-1657" },
    { slug: "boramae", name: "F45 보라매", address: "보라매로5가길 16 3층", phone: "0507-1381-5238" }
  ].map(function (branch) {
    return Object.freeze(branch);
  }));
})();
