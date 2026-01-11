import MainLayout from '@/layouts/MainLayout';
import HomePage from '@/pages/HomePage';
import ArtificialStupidity from '@/pages/tools/ArtificialStupidity';
import JsonTools from '@/pages/tools/Json';
import WebTools from '@/pages/tools/Web';
import MediaTools from '@/pages/tools/Media';
import NotFound from '@/pages/NotFound';
import { Spin } from 'antd';
import React, { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const AppRouter: React.FC = () => {
    return (
        <BrowserRouter>
            <MainLayout>
                <Suspense fallback={
                    <div className="flex justify-center items-center h-64">
                        <Spin size="large" />
                    </div>
                }>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        {ArtificialStupidity.map(tool => (
                            <Route
                                key={tool.id}
                                path={tool.path}
                                element={<tool.component />}
                            />
                        ))}
                        {JsonTools.map(tool => (
                            <Route
                                key={tool.id}
                                path={tool.path}
                                element={<tool.component />}
                            />
                        ))}
                        {WebTools.map(tool => (
                            <Route
                                key={tool.id}
                                path={tool.path}
                                element={<tool.component />}
                            />
                        ))}
                        {MediaTools.map(tool => (
                            <Route
                                key={tool.id}
                                path={tool.path}
                                element={<tool.component />}
                            />
                        ))}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </MainLayout>
        </BrowserRouter>
    );
};

export default AppRouter;
