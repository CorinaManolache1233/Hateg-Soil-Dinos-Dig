export function drawGardenPlant(plot, plotIndex, groundY) {
    const visualTag = `garden_plant_${plotIndex}`;
    destroyAll(visualTag);
    if (plot.plantingSpot) plot.plantingSpot.opacity = plot.state === 0 ? 0.8 : 0.16;

    if (plot.state >= 1) {
        if (plot.species === "carrot" || plot.species === "morcov") {
            const leafHeight = plot.state === 1 ? 15 : plot.state === 2 ? 30 : 45;
            add([ rect(6, leafHeight), pos(plot.x, groundY - leafHeight / 2 + 5), anchor("center"), color(34, 139, 34), visualTag, z(9) ]);
            
            if (plot.state === 1) {
                add([ polygon([vec2(-4, 0), vec2(4, 0), vec2(1, 10), vec2(-1, 10)]), pos(plot.x, groundY + 15), color(255, 140, 0), visualTag, z(7) ]);
                add([ rect(2, 10), pos(plot.x, groundY + 30), anchor("center"), color(220, 180, 100), visualTag, z(7) ]); 
            } else if (plot.state === 2) {
                add([ polygon([vec2(-7, 0), vec2(7, 0), vec2(2, 28), vec2(-2, 28)]), pos(plot.x, groundY + 15), color(255, 140, 0), visualTag, z(7) ]);
                add([ rect(2, 16), pos(plot.x, groundY + 50), anchor("center"), color(220, 180, 100), visualTag, z(7) ]); 
                add([ rect(8, 1), pos(plot.x, groundY + 45), anchor("center"), color(220, 180, 100), visualTag, z(7) ]);  
            } else if (plot.state === 3) {
                add([ polygon([vec2(-11, 0), vec2(11, 0), vec2(3, 46), vec2(-3, 46)]), pos(plot.x, groundY + 15), color(255, 140, 0), visualTag, z(7) ]);
                add([ rect(2, 18), pos(plot.x, groundY + 68), anchor("center"), color(220, 180, 100), visualTag, z(7) ]); 
                add([ rect(14, 1), pos(plot.x, groundY + 52), anchor("center"), color(220, 180, 100), visualTag, z(7) ]); 
                add([ rect(10, 1), pos(plot.x, groundY + 62), anchor("center"), color(220, 180, 100), visualTag, z(7) ]);
            }
        } 
        else if (plot.species === "tomato" || plot.species === "rosie") {
// Înălțimea celor 2 bețe verzi
const vineHeight = plot.state === 1 ? 25 : plot.state === 2 ? 45 : 65;

// DOAR cele 2 bețe verzi (fără nicio tufă sau cerc de frunze)
add([ rect(6, vineHeight), pos(plot.x - 8, groundY + 5 - vineHeight / 2), anchor("center"), rotate(5), color(40, 140, 40), visualTag, z(12) ]);
add([ rect(6, vineHeight), pos(plot.x + 8, groundY + 5 - vineHeight / 2), anchor("center"), rotate(-5), color(40, 140, 40), visualTag, z(12) ]);

if (plot.state === 2) {
// Stadiul mediu: roșii MICI și VERZI pe bețe
add([ circle(4), pos(plot.x - 14, groundY - 15), color(100, 180, 50), visualTag, z(13) ]);
add([ circle(5), pos(plot.x + 12, groundY - 25), color(100, 180, 50), visualTag, z(13) ]);
add([ circle(4), pos(plot.x - 6,  groundY - 35), color(100, 180, 50), visualTag, z(13) ]);
} 
else if (plot.state === 3) {
// Stadiul final: roșii MAI MARI și ROȘII pe bețe
add([ circle(6), pos(plot.x - 14, groundY - 15), color(220, 20, 20), visualTag, z(13) ]);
add([ circle(7), pos(plot.x + 12, groundY - 25), color(220, 20, 20), visualTag, z(13) ]);
add([ circle(6), pos(plot.x - 6,  groundY - 35), color(220, 20, 20), visualTag, z(13) ]);
add([ circle(7), pos(plot.x + 10, groundY - 45), color(220, 20, 20), visualTag, z(13) ]);
}
// Stadiul 1: Doar bețele verzi, fără nicio roșie.
}
        else if (plot.species === "potato" || plot.species === "cartof") {
            const bushSize = plot.state === 1 ? 15 : plot.state === 2 ? 28 : 22;
            const plantColor = plot.state === 3 ? rgb(180, 180, 80) : rgb(60, 140, 60);
            
            add([ circle(bushSize), pos(plot.x, groundY - bushSize/2 + 2), anchor("center"), color(plantColor), visualTag, z(9) ]);
            if (plot.state === 2) {
                add([ circle(3), pos(plot.x - 10, groundY - 25), anchor("center"), color(255, 255, 255), visualTag, z(10) ]);
                add([ circle(3), pos(plot.x + 12, groundY - 15), anchor("center"), color(255, 255, 255), visualTag, z(10) ]);
            }
            
            const rootColor = rgb(230, 210, 170);
            const potatoColor = rgb(210, 170, 110); 

            const rootLen = plot.state === 1 ? 25 : plot.state === 2 ? 40 : 55;
            add([ rect(2, rootLen), pos(plot.x, groundY + 12 + rootLen/2), anchor("center"), color(rootColor), visualTag, z(7) ]); 
            
            if (plot.state === 1) {
                add([ rect(15, 2), pos(plot.x, groundY + 25), anchor("center"), color(rootColor), visualTag, z(7) ]);
                add([ rect(10, 2), pos(plot.x, groundY + 32), anchor("center"), color(rootColor), visualTag, z(7) ]);
            } else if (plot.state === 2) {
                add([ rect(30, 2), pos(plot.x, groundY + 28), anchor("center"), color(rootColor), visualTag, z(7) ]);
                add([ rect(20, 2), pos(plot.x, groundY + 42), anchor("center"), color(rootColor), visualTag, z(7) ]);
                add([ circle(4), pos(plot.x - 12, groundY + 28), anchor("center"), color(potatoColor), visualTag, z(7) ]);
                add([ circle(3), pos(plot.x + 10, groundY + 31), anchor("center"), color(potatoColor), visualTag, z(7) ]);
                add([ circle(4), pos(plot.x - 5, groundY + 42), anchor("center"), color(potatoColor), visualTag, z(7) ]);
            } else if (plot.state === 3) {
                add([ rect(42, 2), pos(plot.x, groundY + 32), anchor("center"), color(rootColor), visualTag, z(7) ]);
                add([ rect(28, 2), pos(plot.x, groundY + 48), anchor("center"), color(rootColor), visualTag, z(7) ]);
                add([ rect(18, 2), pos(plot.x, groundY + 62), anchor("center"), color(rootColor), visualTag, z(7) ]);
                
                add([ circle(8), pos(plot.x - 16, groundY + 30), anchor("center"), color(potatoColor), visualTag, z(7) ]);
                add([ circle(7), pos(plot.x + 17, groundY + 34), anchor("center"), color(potatoColor), visualTag, z(7) ]);
                add([ circle(9), pos(plot.x - 10, groundY + 48), anchor("center"), color(potatoColor), visualTag, z(7) ]);
                add([ circle(7), pos(plot.x + 12, groundY + 54), anchor("center"), color(potatoColor), visualTag, z(7) ]);
            }
        }
    }
}
