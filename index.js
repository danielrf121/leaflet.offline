/* global L,LeafletOffline, $  */
const urlTemplate = 'https://{s}.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4&zoom={z}&x={x}&y={y}';

function showTileList() {
  LeafletOffline.getStorageInfo(urlTemplate).then((r) => {
    const list = document.getElementById('tileinforows');
    list.innerHTML = '';
    for (let i = 0; i < r.length; i += 1) {
      const createdAt = new Date(r[i].createdAt);
      list.insertAdjacentHTML(
        'beforeend',
        `<tr><td>${i}</td><td>${r[i].url}</td><td>${
          r[i].key
        }</td><td>${createdAt.toDateString()}</td></tr>`,
      );
    }
  });
}

$('#storageModal').on('show.bs.modal', () => {
  showTileList();
});




const map = L.map('map');
// offline baselayer, will use offline source if available
const baseLayer = L.tileLayer
  .offline(urlTemplate, {
    attribution: 'Map data {attribution.OpenStreetMap}',
    subdomains: ['opencache', 'opencache2', 'opencache3'],
  })
  .addTo(map);
// add buttons to save tiles in area viewed
const control = L.control.savetiles(baseLayer, {
  zoomlevels: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
  parallel: 1,
  confirm(layer, succescallback) {
    // eslint-disable-next-line no-alert
    if (window.confirm(`Save ${layer._tilesforSave.length}`)) {
      succescallback();
    }
  },
  confirmRemoval(layer, successCallback) {
    // eslint-disable-next-line no-alert
    if (window.confirm('Remove all the tiles?')) {
      successCallback();
    }
  },
  saveText:
    '<i class="fa fa-download" aria-hidden="true" title="Save tiles"></i>',
  rmText: '<i class="fa fa-trash" aria-hidden="true"  title="Remove tiles"></i>',
});
control.addTo(map);

map.setView(
  {
    lat: 58.970311,
    lng: 5.730891,
  },
  16,
);
// layer switcher control
const layerswitcher = L.control
  .layers({
    'osm (offline)': baseLayer,
  }, null, { collapsed: false })
  .addTo(map);

let storageLayer;

const getGeoJsonData = () => LeafletOffline.getStorageInfo(urlTemplate)
  .then((data) => LeafletOffline.getStoredTilesAsJson(baseLayer, data));

const addStorageLayer = () => {
  getGeoJsonData().then((geojson) => {
    storageLayer = L.geoJSON(geojson).bindPopup(
      (clickedLayer) => clickedLayer.feature.properties.key,
    );
    layerswitcher.addOverlay(storageLayer, 'stored tiles');
  });
};

addStorageLayer();

document.getElementById('remove_tiles').addEventListener('click', () => {
  control._rmTiles();
});
document.getElementById('save_tiles').addEventListener('click', () => {
  control._saveTiles();
})

baseLayer.on('storagesize', (e) => {
  document.getElementById('storage').innerHTML = e.storagesize;
  if (storageLayer) {
    storageLayer.clearLayers();
    getGeoJsonData().then((data) => {
      storageLayer.addData(data);
    });
  }
});

// events while saving a tile layer
let progress;
baseLayer.on('savestart', (e) => {
  progress = 0;
  document.getElementById('total').innerHTML = e._tilesforSave.length;
});
baseLayer.on('savetileend', () => {
  progress += 1;
  document.getElementById('progress').innerHTML = progress;
});

var i = 0;
function move() {
  if (i == 0) {
    i = 1;
    var elem = document.getElementById("myBar");
    var width = 10;
    var id = setInterval(frame, 10);
    function frame() {
      if (width >= 100) {
        clearInterval(id);
        i = 0;
      } else {
        width++;
        elem.style.width = width + "%";
        elem.innerHTML = width + "%";
      }
    }
  }
}
