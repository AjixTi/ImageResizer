import React, { useState, useEffect } from 'react';
import { Button, Typography, Grid, Paper, Divider, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import RefreshIcon from '@material-ui/icons/Refresh';
import ImageIcon from '@material-ui/icons/Image';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import ImageList from './ImageList';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    button: {
        margin: theme.spacing(1),
    },
    imageStats: {
        margin: theme.spacing(2, 0),
    },
    divider: {
        margin: theme.spacing(2, 0),
    },
    results: {
        margin: theme.spacing(2, 0),
    },
    chipSuccess: {
        backgroundColor: theme.palette.success.main,
        color: theme.palette.common.white,
    },
    chipError: {
        backgroundColor: theme.palette.error.main,
        color: theme.palette.common.white,
    },
}));

function ResizePanel({ images, onRefresh, onProcess, results }) {
    const classes = useStyles();
    const [selectedImages, setSelectedImages] = useState({});
    const [loading, setLoading] = useState(false);

    // 画像リストが変更されたら選択をリセット
    useEffect(() => {
        const newSelectedImages = {};
        images.forEach((imagePath) => {
            newSelectedImages[imagePath] = false;
        });
        setSelectedImages(newSelectedImages);
    }, [images]);

    // 画像選択の変更を処理
    const handleSelectImage = (newSelectedImages) => {
        setSelectedImages(newSelectedImages);
    };

    // 画像処理を実行
    const handleProcessImages = async () => {
        const imagesToProcess = Object.keys(selectedImages).filter((imagePath) => selectedImages[imagePath]);

        if (imagesToProcess.length === 0) {
            return;
        }

        setLoading(true);
        try {
            await onProcess(imagesToProcess);
        } finally {
            setLoading(false);
        }
    };

    // 画像リストを更新
    const handleRefreshImages = async () => {
        setLoading(true);
        try {
            await onRefresh();
        } finally {
            setLoading(false);
        }
    };

    // 選択された画像の数を取得
    const getSelectedCount = () => {
        return Object.values(selectedImages).filter(Boolean).length;
    };

    return (
        <div className={classes.root}>
            <Paper className={classes.paper}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item>
                        <Typography variant="h6">画像リサイズ</Typography>
                    </Grid>
                    <Grid item>
                        <Button variant="outlined" color="primary" startIcon={<RefreshIcon />} onClick={handleRefreshImages} disabled={loading}>
                            画像リスト更新
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" color="primary" startIcon={<ImageIcon />} onClick={handleProcessImages} disabled={getSelectedCount() === 0 || loading}>
                            選択した{getSelectedCount()}件の画像をリサイズ
                        </Button>
                    </Grid>
                </Grid>

                <Box className={classes.imageStats}>
                    <Typography variant="body2" color="textSecondary">
                        合計 {images.length} 件の画像が見つかりました。
                    </Typography>
                </Box>

                <ImageList images={images} selectedImages={selectedImages} onSelectImage={handleSelectImage} loading={loading} />
            </Paper>

            {results && results.length > 0 && (
                <Paper className={classes.paper}>
                    <Typography variant="h6" gutterBottom>
                        処理結果
                    </Typography>

                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>元ファイル</TableCell>
                                    <TableCell>ステータス</TableCell>
                                    <TableCell>出力先</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {results.map((result, index) => (
                                    <TableRow key={index}>
                                        <TableCell component="th" scope="row">
                                            {result.original.split('/').pop()}
                                        </TableCell>
                                        <TableCell>{result.success ? <Chip icon={<CheckCircleIcon />} label="成功" size="small" className={classes.chipSuccess} /> : <Chip icon={<ErrorIcon />} label="エラー" size="small" className={classes.chipError} />}</TableCell>
                                        <TableCell>{result.success ? result.directory : result.error}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}
        </div>
    );
}

export default ResizePanel;
