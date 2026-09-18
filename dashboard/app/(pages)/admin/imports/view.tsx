"use client";

import { uuid, parseFile } from "@/app/utils";
import { useCallback, useEffect, useState, useMemo } from "react";
import { renderField } from "@/app/render";
import { renderChart } from "@/app/renderChart";
import Terminal, { ColorMode, TerminalOutput } from 'react-terminal-ui';


import { CHART_TYPES, FIELD_TYPES, SIZES } from "@/app/constants";
import { Button, Form, FormItem, Heading, Section } from "@carbon/react";
import { Imports } from "@/app/services/imports";

interface ImportsViewProps {
    translations?: Record<string, any>;
    followers?: string[];
    followings?: string[];
}

export default function ImportsView({ translations, followers, followings }: ImportsViewProps) {

    const [files, setFiles] = useState<Record<string, any[]>>({ file: [] });
    const [ready, setReady] = useState<boolean>(false);
    const [uploading, setUploading] = useState<boolean>(false);
    const [removing, setRemoving] = useState<boolean>(false);
    const [formState, setFormState] = useState<Record<string, any>>({});
    const [importLog, setImportLog] = useState<string[]>([]);
    const [percentage, setPercentage] = useState<number>(0);
    const [importing, setImporting] = useState<boolean>(false);


    const onAddFileHandler = useCallback((field: string, uploadedFiles: any) => {
        setUploading(true);
        const processedFiles = uploadedFiles.map((file: any) => ({
            file: file,
            id: uuid(),
        }));

        setFiles((prevFiles) => ({
            ...prevFiles,
            [field]: [...(prevFiles[field] || []), ...processedFiles],
        }));

        setFormState((prevState: Record<string, any>) => ({
            ...prevState,
            [field]: [...(prevState[field] || []), ...uploadedFiles],
        }));
        setUploading(false);
    }, []);

    const parseHTML = useCallback(async (file: File, updatingField?: string) => {
        const { doc } = await parseFile(file);
        const elements: NodeListOf<HTMLAnchorElement | HTMLHeadingElement> = doc.querySelectorAll(updatingField === "following" ? "h2" : "a");
        const list = Array.from(elements).filter((el: HTMLAnchorElement | HTMLHeadingElement) =>
            updatingField === 'following' ? (el as HTMLHeadingElement).textContent : (el as HTMLAnchorElement).href?.match(/instagram\.com/)).map((el: HTMLAnchorElement | HTMLHeadingElement) => (el.textContent || ""));
        return list;
    }, []);

    useEffect(() => {
        const parseFiles = async () => {
            for (const fileObj of files.file) {
                const updatingField = fileObj.file.name.match(/^(followers|following)/)?.[1];
                const parsedFile = await parseHTML(fileObj.file, updatingField);
                setFormState((prevState: Record<string, any>) => ({
                    ...prevState,
                    [updatingField]: [
                        ...new Set([
                            ...(prevState[updatingField] || []),
                            ...parsedFile,
                        ])
                    ],
                }));
            }
        };
        parseFiles();
    }, [files, parseHTML]);

    // Effect para calcular las diferencias cuando se completa la carga
    useEffect(() => {
        if (!uploading &&
            formState.followers && formState.followers.length > 0 &&
            formState.following && formState.following.length > 0) {
            const followersDifference = followers?.filter((item: string) => !formState.followers.includes(item));
            const followingDifference = followings?.filter((item: string) => !formState.following.includes(item));
            const notFollowingAndFollowing = followings?.filter((item: string) => !followers?.includes(item));
            setFormState((prevState: Record<string, any>) => ({
                ...prevState,
                followersDifference,
                followingDifference,
                notFollowingAndFollowing,
            }));
            setReady(true);
        }
    }, [uploading, formState.followers, formState.following, followers, followings]);

    // Effect separado para limpiar estado cuando se remueve un archivo
    useEffect(() => {
        if (removing) {
            setReady(false);
            setFormState((prevState: Record<string, any>) => ({
                ...prevState,
                followers: [],
                following: [],
                followersDifference: [],
                followingDifference: [],
                notFollowingAndFollowing: [],
            }));
            // Resetear el flag de removing después de la limpieza
            setRemoving(false);
        }
    }, [removing]);

    const onRemoveFileHandler = useCallback((field: string, fileObj: Record<string, any>) => {
        setRemoving(true);
        setFiles((prevFiles) => {
            const updatedFiles = { ...prevFiles };
            const index = updatedFiles[field].findIndex(
                (file: Record<string, any>) => file.id === fileObj.id
            );
            if (index !== -1) {
                updatedFiles[field] = updatedFiles[field].filter((_, i) => i !== index);
            }
            return updatedFiles;
        });

        setFormState((prevFormState: Record<string, any>) => {
            const newFormState = { ...prevFormState };
            delete newFormState[field];
            return newFormState;
        });
    }, []);

    const uploadField = useMemo(() => renderField({
        type: FIELD_TYPES.FILE_UPLOADER,
        field: "file",
        translations,
        files: files,
        size: SIZES.SM,
        onAddFileHandler,
        onRemoveFileHandler,
    }), [files, translations, onAddFileHandler, onRemoveFileHandler]);

    const importChartData = useMemo(() => ({
        type: CHART_TYPES.VALUES,
        options: {
            title: translations?.chart.import.title,
        },
        data: [
            { label: translations?.chart.import.currentFollowers, value: followers?.length || 0 },
            { label: translations?.chart.import.currentFollowings, value: followings?.length || 0 },
            { label: translations?.chart.import.newFollowers, value: formState.followers?.length || 0 },
            { label: translations?.chart.import.newFollowings, value: formState.following?.length || 0 },
            { label: translations?.chart.import.followersDifference, value: formState.followersDifference?.length || 0 },
            { label: translations?.chart.import.followingDifference, value: formState.followingDifference?.length || 0 },
            { label: translations?.chart.import.notFollowingAndFollowing, value: formState.notFollowingAndFollowing?.length || 0 },
        ],
    }), [translations, followers?.length, followings?.length, formState.followers?.length, formState.following?.length, formState.followersDifference?.length, formState.followingDifference?.length, formState.notFollowingAndFollowing?.length]);


    const progressBarData = useMemo(() => ({
        type: CHART_TYPES.SIMPLE_BAR,
        options: {
            title: translations?.chart.progress.importProgress,
            resizable: true,
            toolbar: {
                enabled: false,
            },
            legend: {
                enabled: false,
            },
            meter: {
                proportional: {
                    total: 100,
                },
            },
            height: "90px",
        },
        data: [{ group: translations?.chart.progress.total, value: percentage }],
    }), [translations?.chart.progress.importProgress, translations?.chart.progress.total, percentage]);


    const watchImportProgress = (importId: string) => {
        return new Promise<void>((resolve, reject) => {

            const eventSource = new EventSource(
                `/api/imports/progress?id=${importId}`
            );

            eventSource.onmessage = (event) => {
                debugger;
                const progress = JSON.parse(event.data);

                const percentage = Math.round(
                    (progress.processed / progress.total) * 100
                );

                setImportLog(progress.log);
                setPercentage(percentage);

                if (progress.status === "completed") {
                    eventSource.close();
                    resolve();
                }
                if (progress.status === "error") {
                    eventSource.close();
                    reject(new Error("Import process encountered an error"));
                }
            };
            eventSource.onerror = (error) => {
                eventSource.close();
                reject(error);
            };
        });
    };

    const onSaveHandler = async () => {
        const obj = {
            sameFollowers: formState.followers.filter((item: string) => followers?.includes(item)),
            sameFollowings: formState.following.filter((item: string) => followings?.includes(item)),
            newFollowers: formState.followers.filter((item: string) => !followers?.includes(item)),
            newFollowings: formState.following.filter((item: string) => !followings?.includes(item)),
            unfollow: formState.followersDifference,
            notFollowing: formState.followingDifference
        }

        const importId = await Imports.onSave(obj);
        if (importId) {
            setImporting(true);
            await watchImportProgress(importId);
            setImporting(false);
        }
    };
    return (
        <div className="imports-view">
            <Section className="fields" as="section" level={3}>
                <Heading>{translations?.title}</Heading>
                <Form>
                    <div className="wrapper-fields">
                        <FormItem>{uploadField}</FormItem>
                    </div>
                    <footer>
                        <Button disabled={!ready} kind="secondary" onClick={onSaveHandler} size={SIZES.MD}>{translations?.button}</Button>
                    </footer>
                </Form>
            </Section>
            <Section className="values-chart">
                {renderChart(importChartData, "import-data")}
            </Section>
            {importing ?
                <><Section className="import-progress">
                    {renderChart(progressBarData, "import-progress")}
                </Section>
                    <Section className="import-log">
                        <Terminal prompt={"$"} TopButtonsPanel={() => null} colorMode={ColorMode.Dark}>
                            {importLog.map((log, index) => (
                                <TerminalOutput key={index}>{log}</TerminalOutput>
                            ))}
                        </Terminal>
                    </Section>
                </> : null}
        </div>
    );
}