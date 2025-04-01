import React, { useState } from 'react';
import { Button, Typography, Grid, Paper, Divider, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SyncIcon from '@material-ui/icons/Sync';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import NewReleasesIcon from '@material-ui/icons/NewReleases';

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
    divider: {
        margin: theme.spacing(2, 0),
    },
    noConfig: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    chipSuccess: {
        backgroundColor: theme.palette.success.main,
        color: theme.palette.common.white,
    },
    chipError: {
        backgroundColor: theme.palette.error.main,
        color: theme.palette.common.white,
    },
    chipNew: {
        backgroundColor: theme.palette.info.main,
        color: theme.palette.common.white,
    },
    chipOutdated: {
        backgroundColor: theme.palette.warning.main,
        color: theme.palette.common.white,
    },
    configItem: {
        margin: theme.spacing(1, 0),
    },
    progress: {
        marginLeft: theme.spacing(2),
    },
}));

function SyncPanel({ config, onSync, results }) {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);

    const handleSync = async () => {
        setLoading(true);
        try {
            await onSync();
        } finally {
            setLoading(false);
        }
    };

    const getReason = (reason) => {
        switch (reason) {
            case 'file_not_exist':
                return <Chip icon={<NewReleasesIcon />} label="新規" size="small" className={classes.chipNew} />;
            case 'outdated':
                return <Chip icon={<SyncIcon />} label="更新" size="small" className={classes.chipOutdated} />;
            default:
                return reason;
        }
    };

    // 設定が不完全な場合
    if (!config || !config.SaiSync || !config.SaiSync.src_dir || !config.SaiSync.dst_dir) {
        return (
            <Paper className={classes.paper}>
                <Typography className={classes.noConfig}>同期設定が完了していません。設定タブから設定を行ってください。</Typography>
            </Paper>
        );
    }

    return (
        <div className={classes.root}>
            <Paper className={classes.paper}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item>
                        <Typography variant="h6">SAIファイル同期</Typography>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" color="primary" startIcon={<SyncIcon />} onClick={handleSync} disabled={loading}>
                            同期を実行
                        </Button>
                        {loading && <CircularProgress size={24} className={classes.progress} />}
                    </Grid>
                </Grid>

                <Box className={classes.configItem}>
                    <Typography variant="subtitle2">元ディレクトリ</Typography>
                    <Typography variant="body2">{config.SaiSync.src_dir}</Typography>
                </Box>

                <Box className={classes.configItem}>
                    <Typography variant="subtitle2">先ディレクトリ</Typography>
                    <Typography variant="body2">{config.SaiSync.dst_dir}</Typography>
                </Box>
            </Paper>

            {results && results.syncedFiles && results.syncedFiles.length > 0 && (
                <Paper className={classes.paper}>
                    <Typography variant="h6" gutterBottom>
                        同期結果
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        {results.totalSynced} 件のファイルを同期しました
                    </Typography>

                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>ファイル名</TableCell>
                                    <TableCell>ステータス</TableCell>
                                    <TableCell>理由</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {results.syncedFiles.map((file, index) => (
                                    <TableRow key={index}>
                                        <TableCell component="th" scope="row">
                                            {file.file}
                                        </TableCell>
                                        <TableCell>{file.success ? <Chip icon={<CheckCircleIcon />} label="成功" size="small" className={classes.chipSuccess} /> : <Chip icon={<ErrorIcon />} label="エラー" size="small" className={classes.chipError} />}</TableCell>
                                        <TableCell>
                                            {getReason(file.reason)}
                                            {!file.success && ` - ${file.error}`}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {results && results.syncedFiles && results.syncedFiles.length === 0 && (
                <Paper className={classes.paper}>
                    <Typography variant="body1" align="center" color="textSecondary">
                        同期の必要があるファイルはありませんでした
                    </Typography>
                </Paper>
            )}
        </div>
    );
}

export default SyncPanel;
