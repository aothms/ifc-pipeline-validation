import ResponsiveAppBar from './ResponsiveAppBar'
import Disclaimer from './Disclaimer';
import { useParams } from 'react-router-dom'

import Footer from './Footer'
import Grid from '@mui/material/Grid';
import GeneralTable from './GeneralTable';
import SyntaxResult from './SyntaxResult.js'
import SchemaResult from './SchemaResult';
import BsddTreeView from './BsddTreeView'
import GherkinResults from './GherkinResult';
import SideMenu from './SideMenu';

import { useEffect, useState, useContext } from 'react';
import { FETCH_PATH } from './environment'
import { PageContext } from './Page';
import HandleAsyncError from './HandleAsyncError';
import { messageToStatus } from './mappings'

function Report({ kind }) {
  const context = useContext(PageContext);

  const [isLoggedIn, setLogin] = useState(false);
  const [reportData, setReportData] = useState({});
  const [user, setUser] = useState(null)
  const [isLoaded, setLoadingStatus] = useState(false)

  const { modelCode } = useParams()

  const [prTitle, setPrTitle] = useState("")
  const [commitId, setCommitId] = useState("")

  const handleAsyncError = HandleAsyncError();

  useEffect(() => {
    fetch(context.sandboxId ? `${FETCH_PATH}/api/sandbox/me/${context.sandboxId}` : `${FETCH_PATH}/api/me`)
      .then(response => response.json())
      .then((data) => {
        if (data["redirect"] !== undefined) {
          window.location.href = data.redirect;
        }
        else {
          setLogin(true);
          setUser(data["user_data"]);
          data["sandbox_info"]["pr_title"] && setPrTitle(data["sandbox_info"]["pr_title"]);
          data["sandbox_info"]["commit_id"] && setCommitId(data["sandbox_info"]["commit_id"]);
        }
      }).catch(handleAsyncError);
  }, [context, handleAsyncError]);


  function getReport(code) {
    fetch(`${FETCH_PATH}/api/report2/${code}`)
      .then(response => response.json())
      .then((data) => {
        setReportData(data);
        setLoadingStatus(true);
      })
  }

  useEffect(() => {
    getReport(modelCode);
  }, [modelCode]);

  let numSyntax = 0; 
  let numSchema = 0;
  let numBsdd = 0;
  let numRules = 0;

  if (reportData && reportData.results) {
    numSyntax = reportData.results.syntax_result.length;
    numSchema = reportData.results.schema_result.length;
  
    Object.entries(reportData.results.bsdd_results.bsdd || {}).forEach(([domain, classifications], l1) => {
      Object.entries(classifications).forEach(([classification, results], l2) => {
        if (domain !== "no IfcClassification" && classification !== "no IfcClassificationReference") {
          results.forEach((result) => {
            numBsdd += result.val_ifc_type !== true;
            numBsdd += result.val_property_set !== true;
            numBsdd += result.val_property_name !== true;
            numBsdd += result.val_property_type !== true;
            numBsdd += result.val_property_value !== true;
          });
        }
      });
    });

    if (reportData.tasks.gherkin_rules && reportData.tasks.gherkin_rules.results.length > 0) {
      numRules = reportData.tasks.gherkin_rules.results.filter((result) => messageToStatus(result.message) === 'i').length
    }
  }
  
  if (isLoggedIn) {
    console.log("Report data ", reportData)
    return (
      <div>
        <Grid direction="column"
          container
          style={context.printView ? {} :  {
            minHeight: '100vh', alignItems: 'stretch',
          }} >
          {context.printView || <ResponsiveAppBar user={user} />}
          <Grid
            container
            flex={1}
            direction="row"
            style={{
            }}
          >
            {context.printView || <SideMenu />}

            <Grid
              container
              flex={1}
              direction="column"
              style={context.printView ? {} : {
                justifyContent: "space-between",
                overflow: 'scroll',
                boxSizing: 'border-box',
                maxHeight: '90vh',
                overflowX: 'hidden'
              }}
            >
              <div style={{
                gap: '10px',
                flex: 1
              }}>
                <Grid
                  container
                  spacing={0}
                  direction="column"
                  alignItems="center"
                  justifyContent="space-between"
                  style={context.printView ? {gap: '15px'} : {
                    minHeight: '100vh', gap: '15px', backgroundColor: 'rgb(242 246 248)',
                    border: context.sandboxId ? 'solid 12px red' : 'none'
                  }}
                >
                  {context.sandboxId && <h2
                    style={{
                      background: "red",
                      color: "white",
                      marginTop: "-16px",
                      lineHeight: "30px",
                      padding: "12px",
                      borderRadius: "0 0 16px 16px"
                    }}
                  >Sandbox for <b>{prTitle}</b></h2>}
                  {context.printView || <Disclaimer />}
                  {isLoaded
                    ? <>
                        {(kind === "syntax_and_schema") && <h2>Syntax and Schema Report</h2>}
                        {(kind === "bsdd") && <h2>bSDD Report</h2>}
                        {(kind === "rules") && <h2>Rules Report</h2>}
                        {(kind === "file") && <h2>File metrics</h2>}
                        {(kind === "all") && <h2>Validation report</h2>}

                        <GeneralTable data={reportData} type={"general"} />

                        {(kind === "all") && <div style={{display: 'flex', gap: '100px'}}>
                            <a href='#syntax'>{numSyntax} syntax issues</a>
                            {(typeof(numSchema) !== 'undefined') && <>
                              <a href='#schema'>{numSchema} schema issues</a>
                              <a href='#bsdd'>{numBsdd} bsdd issues</a>
                              <a href='#rules'>{numRules} rules issues</a>
                            </>}
                          </div>}

                        {(kind === "syntax_and_schema" || kind === "all") && <><a id='syntax' /><SyntaxResult status={reportData["model"]["status_syntax"]} summary={"Syntax"} content={reportData["results"]["syntax_result"]} /></>}
                        {(kind === "syntax_and_schema" || kind === "all") && <><a id='schema' /><SchemaResult status={reportData["model"]["status_schema"]} summary={"Schema"} content={reportData["results"]["schema_result"]} instances={reportData.instances} /></>}
                        {(kind === "bsdd" || kind === "all") && <><a id='bsdd' /><BsddTreeView status={reportData["model"]["status_bsdd"]} summary={"bSDD"} bsddResults={reportData["results"]["bsdd_results"]} /></>}
                        {(kind === "rules" || kind === "all") && <><a id='rules' /><GherkinResults status={reportData["model"]["status_ia"]} gherkin_task={reportData.tasks.gherkin_rules} /></>}
                      </>
                    : <div>Loading...</div>}
                  {context.printView || <Footer />}
                </Grid>
              </div>
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default Report;