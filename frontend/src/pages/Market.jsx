import React, { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from "recharts";
import { TrendingUp, MapPin, Loader2, AlertCircle } from "lucide-react";
import { fetchMandiPrices, reverseGeocode } from "../api/mandi";
import { useTranslation } from "react-i18next";

const Market = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [marketData, setMarketData] = useState([]);
    const [location, setLocation] = useState({
        state: "",
        district: ""
    });
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);

            try {
                if (!navigator.geolocation) {
                    setError(t('geo_not_supported'));
                    setLoading(false);
                    return;
                }

                // Get GPS Location
                const position = await new Promise((resolve, reject) =>
                    navigator.geolocation.getCurrentPosition(resolve, reject)
                );

                const { latitude, longitude } = position.coords;

                // Reverse Geocode
                const geoData = await reverseGeocode(latitude, longitude);

                if (!geoData?.state) {
                    setError(t('region_not_detected'));
                    setLoading(false);
                    return;
                }

                setLocation({
                    state: geoData.state,
                    district: geoData.district
                });

                // Fetch mandi prices
                const data = await fetchMandiPrices(
                    geoData.state,
                    geoData.district
                );

                setMarketData(data);

                if (data.length > 0) {
                    const processed = data.slice(0, 5).map(item => ({
                        market: item.market,
                        price: Number(item.modal_price)
                    }));
                    setChartData(processed);
                }

            } catch (err) {
                console.error(err);
                setError(t('market_fetch_failed'));
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const TREND_DATA = [
        { month: "Jan", Tomato: 40, Potato: 25, Onion: 30 },
        { month: "Feb", Tomato: 35, Potato: 28, Onion: 35 },
        { month: "Mar", Tomato: 45, Potato: 22, Onion: 40 },
        { month: "Apr", Tomato: 50, Potato: 20, Onion: 55 },
        { month: "May", Tomato: 60, Potato: 25, Onion: 60 },
        { month: "Jun", Tomato: 40, Potato: 30, Onion: 45 }
    ];

    return (
        <div className="flex flex-col min-h-full pb-20">
            <div className="p-4 md:p-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
                        {t('market_title')}
                    </h1>
                    <p className="text-muted-foreground mt-2 flex items-center gap-2">
                        {t('market_subtitle')}
                        {location.state && (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                <MapPin className="h-3 w-3 mr-1" />
                                {location.district
                                    ? `${location.district}, `
                                    : ""}
                                {location.state}
                            </span>
                        )}
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        <AlertCircle className="inline h-4 w-4 mr-2" />
                        {error}
                    </div>
                ) : (
                    <>
                        {/* Trend Chart */}
                        <div className="glass-card rounded-xl p-6 border border-border/50">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                                {t('price_trends')}
                            </h2>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={TREND_DATA}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="Tomato" stroke="#DC2626" />
                                        <Line type="monotone" dataKey="Potato" stroke="#D97706" />
                                        <Line type="monotone" dataKey="Onion" stroke="#7C3AED" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Mandi Table */}
                        <div className="glass-card rounded-xl p-6 border border-border/50">
                            <h2 className="text-lg font-semibold mb-4">
                                {t('latest_mandi')}
                            </h2>

                            {marketData.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    {t('no_region_data')}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs uppercase bg-secondary/50">
                                            <tr>
                                                <th className="px-4 py-3">{t('commodity')}</th>
                                                <th className="px-4 py-3">{t('market_col')}</th>
                                                <th className="px-4 py-3">{t('variety')}</th>
                                                <th className="px-4 py-3">{t('price_col')}</th>
                                                <th className="px-4 py-3">{t('date_col')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {marketData.slice(0, 10).map((item, index) => (
                                                <tr key={index} className="border-b">
                                                    <td className="px-4 py-3 font-medium">
                                                        {item.commodity}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {item.market}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {item.variety}
                                                    </td>
                                                    <td className="px-4 py-3 font-bold text-green-600">
                                                        ₹{item.modal_price}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {item.arrival_date}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Comparison Chart */}
                        {chartData.length > 0 && (
                            <div className="glass-card rounded-xl p-6 border border-border/50">
                                <h2 className="text-lg font-semibold mb-4">
                                    {t('price_comparison')}
                                </h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="market" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="price" fill="#16A34A" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Market;
