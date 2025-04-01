import React, { useState, useEffect } from 'react';
import { Grid, TextField, Button, Typography, Paper, Divider, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FolderIcon from '@material-ui/icons/Folder';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';

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
    sizesList: {
        maxHeight: 200,
        overflow: 'auto',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
    },
    divider: {
        margin: theme.spacing(2, 0),
    },
    dialogContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
    },
}));

function ConfigPanel({ config, onSave }) {
    const classes = useStyles();
    const [formData, setFormData] = useState({
        ResizeConfigure: {
            target_dir: '',
        },
        SaiSync: {
            src_dir: '',
            dst_dir: '',
        },
        TwitterSize: 1080,
        Tolerance: 90,
        ReductionValue: 0.9375,
        PixivSizes: [],
    });
    const [sizeDialogOpen, setSizeDialogOpen] = useState(false);
    const [currentSize, setCurrentSize] = useState({ width: '', height: '', index: -1 });

    // 設定が変更されたら状態を更新
    useEffect(() => {
        if (config) {
            setFormData({
                ResizeConfigure: {
                    ...config.ResizeConfigure,
                },
                SaiSync: {
                    ...config.SaiSync,
                },
                TwitterSize: config.TwitterSize || 1080,
                Tolerance: config.Tolerance || 90,
                ReductionValue: config.ReductionValue || 0.9375,
                PixivSizes: Array.isArray(config.PixivSizes) ? [...config.PixivSizes] : [],
            });
        }
    }, [config]);

    // フォームの変更を処理
    const handleChange = (e) => {
        const { name, value } = e.target;

        // フィールド名に . が含まれている場合、ネストされたオブジェクトを更新
        if (name.includes('.')) {
            const [section, key] = name.split('.');
            setFormData({
                ...formData,
                [section]: {
                    ...formData[section],
                    [key]: value,
                },
            });
        } else if (name === 'TwitterSize' || name === 'Tolerance') {
            // 数値フィールド
            setFormData({
                ...formData,
                [name]: parseInt(value, 10) || 0,
            });
        } else if (name === 'ReductionValue') {
            // 浮動小数点数フィールド
            setFormData({
                ...formData,
                [name]: parseFloat(value) || 0,
            });
        } else {
            // その他のフィールド
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    // ディレクトリ選択
    const handleSelectDirectory = async (fieldName) => {
        try {
            const dirPath = await window.electron.selectDirectory();
            if (dirPath) {
                // フィールド名に . が含まれている場合、ネストされたオブジェクトを更新
                if (fieldName.includes('.')) {
                    const [section, key] = fieldName.split('.');
                    setFormData({
                        ...formData,
                        [section]: {
                            ...formData[section],
                            [key]: dirPath,
                        },
                    });
                } else {
                    setFormData({
                        ...formData,
                        [fieldName]: dirPath,
                    });
                }
            }
        } catch (error) {
            console.error('Failed to select directory:', error);
        }
    };

    // フォーム送信
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    // Pixivサイズの追加・編集ダイアログを開く
    const openSizeDialog = (size = null, index = -1) => {
        if (size) {
            setCurrentSize({ width: size[0], height: size[1], index });
        } else {
            setCurrentSize({ width: '', height: '', index: -1 });
        }
        setSizeDialogOpen(true);
    };

    // Pixivサイズダイアログを閉じる
    const closeSizeDialog = () => {
        setSizeDialogOpen(false);
    };

    // Pixivサイズを保存
    const saveSize = () => {
        const width = parseInt(currentSize.width, 10);
        const height = parseInt(currentSize.height, 10);

        if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
            return;
        }

        const newSizes = [...formData.PixivSizes];

        if (currentSize.index >= 0) {
            // 既存のサイズを編集
            newSizes[currentSize.index] = [width, height];
        } else {
            // 新しいサイズを追加
            newSizes.push([width, height]);
        }

        setFormData({
            ...formData,
            PixivSizes: newSizes,
        });

        closeSizeDialog();
    };

    // Pixivサイズを削除
    const deleteSize = (index) => {
        const newSizes = formData.PixivSizes.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            PixivSizes: newSizes,
        });
    };

    return (
        <div className={classes.root}>
            <form onSubmit={handleSubmit}>
                <Paper className={classes.paper}>
                    <Typography variant="h6" gutterBottom>
                        基本設定
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1">対象ディレクトリ</Typography>
                            <Grid container spacing={1} alignItems="center">
                                <Grid item xs>
                                    <TextField fullWidth variant="outlined" name="ResizeConfigure.target_dir" value={formData.ResizeConfigure.target_dir} onChange={handleChange} margin="normal" />
                                </Grid>
                                <Grid item>
                                    <Button variant="contained" color="primary" startIcon={<FolderIcon />} onClick={() => handleSelectDirectory('ResizeConfigure.target_dir')}>
                                        参照
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Paper>

                <Paper className={classes.paper}>
                    <Typography variant="h6" gutterBottom>
                        同期設定
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1">元ディレクトリ（SAIファイル）</Typography>
                            <Grid container spacing={1} alignItems="center">
                                <Grid item xs>
                                    <TextField fullWidth variant="outlined" name="SaiSync.src_dir" value={formData.SaiSync.src_dir} onChange={handleChange} margin="normal" />
                                </Grid>
                                <Grid item>
                                    <Button variant="contained" color="primary" startIcon={<FolderIcon />} onClick={() => handleSelectDirectory('SaiSync.src_dir')}>
                                        参照
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle1">先ディレクトリ</Typography>
                            <Grid container spacing={1} alignItems="center">
                                <Grid item xs>
                                    <TextField fullWidth variant="outlined" name="SaiSync.dst_dir" value={formData.SaiSync.dst_dir} onChange={handleChange} margin="normal" />
                                </Grid>
                                <Grid item>
                                    <Button variant="contained" color="primary" startIcon={<FolderIcon />} onClick={() => handleSelectDirectory('SaiSync.dst_dir')}>
                                        参照
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Paper>

                <Paper className={classes.paper}>
                    <Typography variant="h6" gutterBottom>
                        リサイズ設定
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="Twitter最大サイズ (px)" type="number" variant="outlined" name="TwitterSize" value={formData.TwitterSize} onChange={handleChange} margin="normal" />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="許容範囲 (px)" type="number" variant="outlined" name="Tolerance" value={formData.Tolerance} onChange={handleChange} margin="normal" />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="縮小率" type="number" variant="outlined" name="ReductionValue" value={formData.ReductionValue} onChange={handleChange} margin="normal" inputProps={{ step: 0.01, min: 0.1, max: 1 }} />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle1">
                                Pixivサイズリスト
                                <IconButton color="primary" size="small" onClick={() => openSizeDialog()} style={{ marginLeft: 8 }}>
                                    <AddIcon />
                                </IconButton>
                            </Typography>

                            <List className={classes.sizesList}>
                                {formData.PixivSizes &&
                                    formData.PixivSizes.map((size, index) => (
                                        <ListItem key={index} divider>
                                            <ListItemText primary={`${size[0]} × ${size[1]} px`} />
                                            <IconButton edge="end" onClick={() => openSizeDialog(size, index)} size="small">
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton edge="end" onClick={() => deleteSize(index)} size="small">
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </ListItem>
                                    ))}
                                {(!formData.PixivSizes || formData.PixivSizes.length === 0) && (
                                    <ListItem>
                                        <ListItemText primary="サイズが設定されていません" />
                                    </ListItem>
                                )}
                            </List>
                        </Grid>
                    </Grid>
                </Paper>

                <Grid container justifyContent="flex-end">
                    <Button variant="contained" color="primary" className={classes.button} type="submit">
                        設定を保存
                    </Button>
                </Grid>
            </form>

            {/* Pixivサイズ編集ダイアログ */}
            <Dialog open={sizeDialogOpen} onClose={closeSizeDialog}>
                <DialogTitle>{currentSize.index >= 0 ? 'サイズを編集' : 'サイズを追加'}</DialogTitle>
                <DialogContent className={classes.dialogContent}>
                    <TextField label="横幅 (px)" type="number" fullWidth variant="outlined" value={currentSize.width} onChange={(e) => setCurrentSize({ ...currentSize, width: e.target.value })} inputProps={{ min: 1 }} />
                    <TextField label="高さ (px)" type="number" fullWidth variant="outlined" value={currentSize.height} onChange={(e) => setCurrentSize({ ...currentSize, height: e.target.value })} inputProps={{ min: 1 }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeSizeDialog} color="default">
                        キャンセル
                    </Button>
                    <Button onClick={saveSize} color="primary">
                        保存
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default ConfigPanel;
