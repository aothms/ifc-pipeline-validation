import * as React from 'react';
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem from '@mui/lab/TreeItem';
import { statusToColor } from './mappings'
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';
import { useEffect, useState, useContext } from 'react';
import { PageContext } from './Page';

export default function SchemaResult({ summary, content, status, instances }) {
  const context = useContext(PageContext);

  const [data, setRows] = React.useState([])
  const [page, setPage] = useState(0);

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };  

  useEffect(() => {
    let grouped = [];
    const do_slice = (arr) => {
      if (context.printView) {
        return arr;
      } else {
        return arr.slice(page * 10, page * 10 + 10);
      }
    }
    for (let c of do_slice(content || [])) {
      if (grouped.length === 0 || (c.attribute ? c.attribute : 'Uncategorized') !== grouped[grouped.length-1][0]) {
        grouped.push([c.attribute ? c.attribute : 'Uncategorized',[]])
      }
      grouped[grouped.length-1][1].push(c);
    }
    setRows(grouped)
  }, [page, content, context]);

  let expanded = ["root"];
  console.log(context.printView, data);
  if (context.printView) {
    data.forEach(([hd, rows]) => {expanded.push(hd);});
  }

  return (
    <Paper sx={{overflow: 'hidden'}}>
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        defaultExpanded={expanded}
        sx={{
          "width": "850px",
          "backgroundColor": statusToColor[status],
          ".MuiTreeItem-root .MuiTreeItem-root": { backgroundColor: "#ffffff80", overflow: "hidden" },
          ".MuiTreeItem-group .MuiTreeItem-content": { boxSizing: "border-box" },
          ".MuiTreeItem-group": { padding: "16px", marginLeft: 0 },
          "> li > .MuiTreeItem-content": { padding: "16px" },
          ".MuiTreeItem-content.Mui-expanded": { borderBottom: 'solid 1px black' },
          ".MuiTreeItem-group .MuiTreeItem-content.Mui-expanded": { borderBottom: 0 },
          ".caption" : { paddingTop: "1em", textTransform: 'capitalize' },
          ".subcaption" : { visibility: "hidden", fontSize: '80%' },
          ".MuiTreeItem-content.Mui-expanded .subcaption" : { visibility: "visible" },
          "table": { borderCollapse: 'collapse', fontSize: '80%' },
          "td, th": { padding: '0.2em 0.5em', verticalAlign: 'top' },
          ".pre": { whiteSpace: 'pre' }
        }}
      >
        <TreeItem nodeId="root" label="Schema">
          { data.length
            ? data.map(([hd, rows]) => {
                return <TreeView defaultCollapseIcon={<ExpandMoreIcon />} defaultExpanded={expanded}
                  defaultExpandIcon={<ChevronRightIcon />}>
                    <TreeItem nodeId={hd} label={<div><div class='caption'>{(rows[0].constraint_type || '').replace('_', ' ')} - {hd}</div><div class='subcaption'>{rows[0].constraint_type !== 'schema' ? rows[0].msg.split('\n')[0] : '\u00A0'}</div></div>}>
                      <table>
                        <thead>
                          <tr><th>Id</th><th>Entity</th><th>Message</th></tr>
                        </thead>
                        <tbody>
                          {
                            rows.map((row) => {
                              return <tr>
                                <td>{instances[row.instance_id] ? instances[row.instance_id].guid : '?'}</td>
                                <td>{instances[row.instance_id] ? instances[row.instance_id].type : '?'}</td>
                                <td><span class='pre'>{row.constraint_type !== 'schema' ? row.msg.split('\n').slice(2).join('\n') : row.msg}</span></td>
                              </tr>
                            })
                          }
                        </tbody>
                      </table>
                    </TreeItem>
                  </TreeView>
              })
            : <div>{content ? "Valid" : "Not checked"}</div> }
          {
            !context.printView && content.length
            ? <TablePagination
                sx={{display: 'flex', justifyContent: 'center', backgroundColor: statusToColor[status]}}
                rowsPerPageOptions={[10]}
                component="div"
                count={content.length}
                rowsPerPage={10}
                page={page}
                onPageChange={handleChangePage}
              />
            : null
          }
        </TreeItem>
      </TreeView>
    </Paper>
  );
}