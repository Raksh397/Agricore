// High-precision location: watch GPS for a few seconds and keep the best fix.
export const getPreciseLocation = (timeoutMs = 8000) => new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('no geolocation'));
    let best = null;
    const done = () => {
        navigator.geolocation.clearWatch(id);
        if (best) {
            localStorage.setItem('userLocation', JSON.stringify({ latitude: best.coords.latitude, longitude: best.coords.longitude }));
            resolve(best.coords);
        } else reject(new Error('no fix'));
    };
    const id = navigator.geolocation.watchPosition(
        (pos) => {
            if (!best || pos.coords.accuracy < best.coords.accuracy) best = pos;
            if (pos.coords.accuracy <= 25) done(); // good enough — stop early
        },
        (err) => { navigator.geolocation.clearWatch(id); best ? done() : reject(err); },
        { enableHighAccuracy: true, maximumAge: 0, timeout: timeoutMs }
    );
    setTimeout(done, timeoutMs);
});
