(async () => {
    const { missions } = await import("./missions.js");
    const { guidToName, brickToName } = await import("./friendlyNames.js");

    const selectedMissions = {};

    const radioParent = document.getElementById('radio-parent');
    radioParent.innerHTML = '';

    let htmlToAdd = `<div class="accordion" id="mission-accordion">`;
    Object.keys(missions).forEach((mission, missionIndex) => {
        // radioParent.insertAdjacentHTML('beforeend', `<span>${mission}</span>`);

        htmlToAdd += `<div id=${mission} class="accordion-item">
                        <div class="accordion-header" id="heading${missionIndex}">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${missionIndex}" aria-expanded="true" aria-controls="collapse${missionIndex}">${guidToName[mission]}&nbsp;<span id="${mission}-selected-counter">${missions[mission].length}</span>/${missions[mission].length}&nbsp;&nbsp;&nbsp;<span style="color: grey">${mission}</span></button>
                        </div>`;

        selectedMissions[mission] = {};

        missions[mission].forEach((brick, brickIndex) => {
            const isEnabled = true;

            htmlToAdd +=
                `<div id="collapse${missionIndex}" class="accordion-collapse collapse" aria-labelledby="heading${missionIndex}">
                    <div class="accordion-body">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" role="switch" id="${mission}-${brick}" ${isEnabled ? 'checked' : ''} onchange="modifySelection('${mission}', '${brick}')">
                            <label class="form-check-label" for="flexSwitchCheckChecked">${brickToName[brick]} <span style="color: grey">(${brick})</span></label>
                        </div>
                    </div>
                </div>`;

            selectedMissions[mission][brick] = isEnabled;
        });

        htmlToAdd += `</div>`;
    });
    htmlToAdd += `</div>`;

    radioParent.insertAdjacentHTML('beforeend', htmlToAdd);

    window.modifySelection = (mission, brick) => {
        console.log(document.getElementById(`${mission}-${brick}`).checked);
        selectedMissions[mission][brick] = document.getElementById(`${mission}-${brick}`).checked;
        document.getElementById(`${mission}-selected-counter`).innerText = Object.values(selectedMissions[mission]).filter(val => val).length;
    };

    window.generate = () => {
        var missionJson = {};
        Object.keys(selectedMissions).forEach(mission => {
            missionJson[mission] = [];
            Object.keys(selectedMissions[mission]).forEach(brick => {
                if(selectedMissions[mission][brick])
                {
                    missionJson[mission].push(brick);
                }
            });
        });

        downloadObjectAsJson(missionJson, 'FreelancerVariationMissions');
    };

    function downloadObjectAsJson(exportObj, exportName){
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", exportName + ".json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
})();
