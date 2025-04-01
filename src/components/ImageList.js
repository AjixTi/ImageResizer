import React, { useState } from 'react';
import { List, ListItem, ListItemText, ListItemSecondaryAction, Checkbox, Paper, Typography, IconButton, Collapse, Divider, Box, LinearProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import FolderIcon from '@material-ui/icons/Folder';
import path from 'path-browserify';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        marginTop: theme.spacing(2),
        maxHeight: 400,
        overflow: 'auto',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(1, 2),
        backgroundColor: theme.palette.background.default,
    },
    folderName: {
        flexGrow: 1,
    },
    imageName: {
        marginLeft: theme.spacing(4),
    },
    emptyList: {
        padding: theme.spacing(2),
        textAlign: 'center',
    },
    progressContainer: {
        margin: theme.spacing(2, 0),
    },
}));

function ImageList({ images, selectedImages, onSelectImage, loading }) {
    const classes = useStyles();
    const [expandedFolders, setExpandedFolders] = useState({});

    // 画像をフォルダーごとにグループ化
    const groupByFolder = (images) => {
        const grouped = {};

        images.forEach((imagePath) => {
            const dirPath = path.dirname(imagePath);
            if (!grouped[dirPath]) {
                grouped[dirPath] = [];
            }
            grouped[dirPath].push(imagePath);
        });

        return grouped;
    };

    // フォルダーを展開/折りたたみ
    const toggleFolder = (folderPath) => {
        setExpandedFolders((prev) => ({
            ...prev,
            [folderPath]: !prev[folderPath],
        }));
    };

    // 全選択/解除
    const handleToggleAll = (folderPath, isSelected) => {
        const folderImages = groupedImages[folderPath];

        // isSelectedがtrueの場合は全選択、falseの場合は全解除
        const newSelectedImages = { ...selectedImages };

        folderImages.forEach((imagePath) => {
            newSelectedImages[imagePath] = !isSelected;
        });

        onSelectImage(newSelectedImages);
    };

    // 単一画像の選択/解除
    const handleToggle = (imagePath) => {
        const newSelectedImages = {
            ...selectedImages,
            [imagePath]: !selectedImages[imagePath],
        };
        onSelectImage(newSelectedImages);
    };

    // フォルダーのすべての画像が選択されているかチェック
    const isFolderSelected = (folderPath) => {
        const folderImages = groupedImages[folderPath];
        return folderImages.every((imagePath) => selectedImages[imagePath]);
    };

    // 画像をグループ化
    const groupedImages = groupByFolder(images);
    const folderPaths = Object.keys(groupedImages);

    if (loading) {
        return (
            <div className={classes.progressContainer}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    画像をロード中...
                </Typography>
                <LinearProgress />
            </div>
        );
    }

    if (images.length === 0) {
        return (
            <Paper className={classes.root}>
                <Typography className={classes.emptyList} color="textSecondary">
                    リサイズ対象の画像がありません
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper className={classes.root}>
            <List disablePadding>
                {folderPaths.map((folderPath, index) => {
                    const isExpanded = !!expandedFolders[folderPath];
                    const folderImages = groupedImages[folderPath];
                    const folderName = path.basename(folderPath);
                    const isAllSelected = isFolderSelected(folderPath);

                    return (
                        <React.Fragment key={folderPath}>
                            {index > 0 && <Divider />}
                            <ListItem button onClick={() => toggleFolder(folderPath)}>
                                <FolderIcon color="primary" style={{ marginRight: 8 }} />
                                <ListItemText primary={folderName} secondary={`${folderImages.length}件の画像`} className={classes.folderName} />
                                <ListItemSecondaryAction>
                                    <Checkbox edge="end" onChange={() => handleToggleAll(folderPath, isAllSelected)} checked={isAllSelected} onClick={(e) => e.stopPropagation()} />
                                    <IconButton
                                        edge="end"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFolder(folderPath);
                                        }}
                                    >
                                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {folderImages.map((imagePath) => {
                                        const imageName = path.basename(imagePath);
                                        return (
                                            <ListItem key={imagePath} dense button onClick={() => handleToggle(imagePath)}>
                                                <ListItemText primary={imageName} className={classes.imageName} />
                                                <ListItemSecondaryAction>
                                                    <Checkbox edge="end" onChange={() => handleToggle(imagePath)} checked={!!selectedImages[imagePath]} />
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            </Collapse>
                        </React.Fragment>
                    );
                })}
            </List>
        </Paper>
    );
}

export default ImageList;
