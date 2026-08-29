(function () {
  "use strict";

  // 지점 찾기 섹션의 실제 확대/축소/이동 가능한 지도 (Leaflet + OpenStreetMap).
  // 카카오맵/네이버맵/구글맵 대신 이 조합을 쓴 이유: 셋 다 지도 서비스에 개발자로
  // 등록해 이 사이트 도메인용 API 키를 발급받아야 동작하는데(사용자가 아직 키가
  // 없어 무료로 바로 쓸 수 있는 방법을 요청함), OpenStreetMap 타일 서버는 가입·키
  // 없이도 정책상 허용되는 수준의 트래픽에서 바로 쓸 수 있음. 대신 카카오맵/네이버맵
  // 대비 국내 지번·건물명 데이터가 상대적으로 부족해 정확도는 다소 떨어질 수 있음.
  //
  // 지점 좌표(각 .branch_item의 data-lat/data-lng)는 OpenStreetMap Nominatim으로
  // 주소를 1회성으로 조회해 미리 구해 넣은 값 — 이 페이지가 실시간으로 지오코딩을
  // 호출하는 게 아니라, 구현 시점에 한 번 조회한 결과를 마크업에 고정해둔 것.
  // 도로명 단위까지만 정확히 매칭되고 정확한 건물 번지까지는 못 찾은 주소도 있어
  // (신사·보라매는 건물 번지까지, 나머지는 도로 단위) 실제 건물 위치와 몇십~백여
  // 미터 정도 오차가 있을 수 있음.
  function initLocatorMap() {
    var mapEl = document.getElementById("locator_map");
    var hasLeaflet = typeof window.L !== "undefined";

    if (!mapEl) {
      return;
    }

    if (!hasLeaflet) {
      mapEl.textContent = "지도를 불러오지 못했습니다.";
      mapEl.style.display = "flex";
      mapEl.style.alignItems = "center";
      mapEl.style.justifyContent = "center";
      return;
    }

    var branchItems = document.querySelectorAll(".branch_item[data-lat][data-lng]");
    if (branchItems.length === 0) {
      return;
    }

    var map = L.map(mapEl, {
      // 페이지를 스크롤하다 지도 위에서 휠을 돌리면 그대로 지도 확대/축소로
      // 먹혀버려 페이지 스크롤이 막히는 문제를 피하려고 기본은 꺼두고,
      // 지도를 클릭(포커스)한 뒤에만 휠 확대를 허용함 — +/- 버튼과 더블클릭,
      // 핀치 확대는 항상 그대로 사용 가능.
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    var latLngs = [];

    branchItems.forEach(function (item) {
      var lat = parseFloat(item.dataset.lat);
      var lng = parseFloat(item.dataset.lng);
      if (isNaN(lat) || isNaN(lng)) {
        return;
      }

      var name = item.dataset.name || "";
      var address = item.dataset.address || "";
      var phoneEl = item.querySelector(".branch_phone");
      var phone = phoneEl ? phoneEl.textContent : "";

      var popupHtml =
        '<p class="map_popup_name">' + name + "</p>" +
        '<p class="map_popup_address">' + address + "</p>" +
        (phone ? '<p class="map_popup_phone">' + phone + "</p>" : "");

      L.marker([lat, lng]).addTo(map).bindPopup(popupHtml);
      latLngs.push([lat, lng]);
    });

    if (latLngs.length > 0) {
      map.fitBounds(latLngs, { padding: [32, 32] });
    }

    mapEl.addEventListener("mouseenter", function () {
      map.scrollWheelZoom.enable();
    });
    mapEl.addEventListener("mouseleave", function () {
      map.scrollWheelZoom.disable();
    });
  }

  document.addEventListener("DOMContentLoaded", initLocatorMap);
})();
