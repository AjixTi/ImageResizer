import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Container, Paper, Tabs, Tab, Box, CircularProgress, Snackbar, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import ConfigPanel from './components/ConfigPanel';
import ImageList from './components/ImageList';
import ResizePanel from './components/ResizePanel';
import SyncPanel from './components/SyncPanel';

// タブパネルコンポーネント
function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
            {value === index && <Box p={3}>{children}</Box>}
        </div>
    );
}

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
    },
    title: {
        flexGrow: 1,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
    paper: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: theme.spacing(4),
    },
}));

function App() {
    const classes = useStyles();
    const [tabValue, setTabValue] = useState(0);
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [images, setImages] = useState([]);
    const [notify, setNotify] = useState({ open: false, message: '' });
    const [processingResults, setProcessingResults] = useState([]);
    const [syncResults, setSyncResults] = useState([]);

    // 設定ファイルのロード
    useEffect(() => {
        const loadConfig = async () => {
            try {
                const result = await window.electron.loadConfig();
                setConfig(result);
            } catch (error) {
                console.error('Failed to load config:', error);
                setNotify({
                    open: true,
                    message: '設定ファイルの読み込みに失敗しました',
                });
            } finally {
                setLoading(false);
            }
        };

        loadConfig();
    }, []);

    // 画像リストの取得
    const handleRefreshImages = async () => {
        if (!config || !config.ResizeConfigure.target_dir) {
            setNotify({
                open: true,
                message: '対象ディレクトリが設定されていません',
            });
            return;
        }

        setLoading(true);
        try {
            const result = await window.electron.getTargetImages(config.ResizeConfigure.target_dir);
            setImages(result);
        } catch (error) {
            console.error('Failed to get images:', error);
            setNotify({
                open: true,
                message: '画像の取得に失敗しました',
            });
        } finally {
            setLoading(false);
        }
    };

    // 設定の保存
    const handleSaveConfig = async (newConfig) => {
        setLoading(true);
        try {
            const result = await window.electron.saveConfig(newConfig);
            if (result.success) {
                setConfig(newConfig);
                setNotify({
                    open: true,
                    message: '設定を保存しました',
                });
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Failed to save config:', error);
            setNotify({
                open: true,
                message: '設定の保存に失敗しました',
            });
        } finally {
            setLoading(false);
        }
    };

    // 画像の処理
    const handleProcessImages = async (selectedImages) => {
        if (!selectedImages || selectedImages.length === 0) {
            setNotify({
                open: true,
                message: '画像が選択されていません',
            });
            return;
        }

        setLoading(true);
        try {
            const results = await window.electron.resizeImages(selectedImages, config);
            setProcessingResults(results);
            setNotify({
                open: true,
                message: `${results.length}件の画像を処理しました`,
            });
            // 処理後に画像リストを更新
            handleRefreshImages();
        } catch (error) {
            console.error('Failed to process images:', error);
            setNotify({
                open: true,
                message: '画像処理に失敗しました',
            });
        } finally {
            setLoading(false);
        }
    };

    // ファイルの同期
    const handleSyncFiles = async () => {
        if (!config || !config.SaiSync.src_dir || !config.SaiSync.dst_dir) {
            setNotify({
                open: true,
                message: '同期ディレクトリが設定されていません',
            });
            return;
        }

        setLoading(true);
        try {
            const results = await window.electron.syncFiles(config.SaiSync.src_dir, config.SaiSync.dst_dir);

            setSyncResults(results);
            setNotify({
                open: true,
                message: `${results.totalSynced}件のファイルを同期しました`,
            });
        } catch (error) {
            console.error('Failed to sync files:', error);
            setNotify({
                open: true,
                message: 'ファイル同期に失敗しました',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChangeTab = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleCloseNotify = () => {
        setNotify({ ...notify, open: false });
    };

    if (loading && !config) {
        return (
            <div className={classes.loading}>
                <CircularProgress />
            </div>
        );
    }

    return (
        <div className={classes.root}>
            <CssBaseline />
            <AppBar position="fixed" className={classes.appBar}>
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        PNG Resizer
                    </Typography>
                </Toolbar>
            </AppBar>
            <Toolbar /> {/* スペーサー */}
            <Container className={classes.content}>
                <Paper className={classes.paper}>
                    <Tabs value={tabValue} onChange={handleChangeTab} indicatorColor="primary" textColor="primary" centered>
                        <Tab label="設定" />
                        <Tab label="画像リサイズ" />
                        <Tab label="ファイル同期" />
                    </Tabs>

                    <TabPanel value={tabValue} index={0}>
                        <ConfigPanel config={config} onSave={handleSaveConfig} />
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <ResizePanel onRefresh={handleRefreshImages} onProcess={handleProcessImages} images={images} results={processingResults} />
                    </TabPanel>

                    <TabPanel value={tabValue} index={2}>
                        <SyncPanel config={config} onSync={handleSyncFiles} results={syncResults} />
                    </TabPanel>
                </Paper>
            </Container>
            {/* 通知 */}
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                open={notify.open}
                autoHideDuration={6000}
                onClose={handleCloseNotify}
                message={notify.message}
                action={
                    <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseNotify}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
            />
        </div>
    );
}

export default App;
