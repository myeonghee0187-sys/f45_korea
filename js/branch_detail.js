(function () {
  "use strict";

  function getRequestedBranch() {
    var branches = window.F45Branches;
    var branchParams = new URLSearchParams(window.location.search).getAll("branch");

    // Exact whitelist lookup: missing, repeated, encoded markup and unknown slugs
    // are never reflected into page text, attributes or metadata.
    if (!Array.isArray(branches) || branchParams.length !== 1) {
      return null;
    }

    return branches.find(function (branch) {
      return branch.slug === branchParams[0];
    }) || null;
  }

  function setText(selector, value) {
    document.querySelectorAll(selector).forEach(function (element) {
      element.textContent = value;
    });
  }

  function setPageMetadata(title, description, hasBranch) {
    document.title = title;
    var descriptionMeta = document.querySelector('meta[name="description"]');
    var robotsMeta = document.querySelector('meta[name="robots"]');

    if (descriptionMeta) {
      descriptionMeta.setAttribute("content", description);
    }
    if (robotsMeta) {
      robotsMeta.setAttribute("content", hasBranch ? "index, follow" : "noindex, follow");
    }
  }

  function initBranchDetail() {
    var branchContent = document.getElementById("branch_content");
    var unavailable = document.getElementById("branch_unavailable");

    if (!branchContent || !unavailable) {
      return;
    }

    var branch = getRequestedBranch();

    if (!branch) {
      branchContent.hidden = true;
      unavailable.hidden = false;
      setText("[data-branch-breadcrumb]", "지점 정보 없음");
      setPageMetadata(
        "지점 정보 없음 | F45 Korea",
        "F45 Korea 지점 찾기에서 가까운 지점의 주소와 연락처를 확인하세요.",
        false
      );
      return;
    }

    setText("[data-branch-name], [data-branch-breadcrumb]", branch.name);
    setText("[data-branch-address]", branch.address);
    setText("[data-branch-phone]", branch.phone);
    document.querySelectorAll("[data-branch-tel]").forEach(function (link) {
      link.setAttribute("href", "tel:" + branch.phone.replace(/\D/g, ""));
      link.setAttribute("aria-label", branch.name + " 전화 걸기 " + branch.phone);
    });
    setPageMetadata(
      branch.name + " | F45 Korea",
      branch.name + " · " + branch.address + ". 지점 연락처, 첫 방문 안내와 F45 트레이닝 경험을 확인하세요.",
      true
    );

    unavailable.hidden = true;
    branchContent.hidden = false;
  }

  document.addEventListener("DOMContentLoaded", initBranchDetail);
})();
