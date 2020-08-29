import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Route, Redirect, withRouter } from 'react-router-dom';
import graphql from 'babel-plugin-relay/macro';
import {
  QueryRenderer,
  requestSubscription,
} from '../../../../relay/environment';
import TopBar from '../../nav/TopBar';
import ThreatActor from './ThreatActor';
import ThreatActorReports from './ThreatActorReports';
import ThreatActorKnowledge from './ThreatActorKnowledge';
import ThreatActorIndicators from './ThreatActorIndicators';
import Loader from '../../../../components/Loader';
import FileManager from '../../common/files/FileManager';
import StixDomainObjectHeader from '../../common/stix_domain_objects/StixDomainObjectHeader';
import ThreatActorPopover from './ThreatActorPopover';
import StixCoreObjectHistory from '../../common/stix_core_objects/StixCoreObjectHistory';

const subscription = graphql`
  subscription RootThreatActorSubscription($id: ID!) {
    stixDomainObject(id: $id) {
      ... on ThreatActor {
        ...ThreatActor_threatActor
        ...ThreatActorEditionContainer_threatActor
      }
      ...FileImportViewer_entity
      ...FileExportViewer_entity
    }
  }
`;

const threatActorQuery = graphql`
  query RootThreatActorQuery($id: String!) {
    threatActor(id: $id) {
      id
      standard_id
      name
      aliases
      ...ThreatActor_threatActor
      ...ThreatActorReports_threatActor
      ...ThreatActorKnowledge_threatActor
      ...ThreatActorIndicators_threatActor
      ...FileImportViewer_entity
      ...FileExportViewer_entity
    }
    connectorsForExport {
      ...FileManager_connectorsExport
    }
  }
`;

class RootThreatActor extends Component {
  componentDidMount() {
    const {
      match: {
        params: { threatActorId },
      },
    } = this.props;
    const sub = requestSubscription({
      subscription,
      variables: { id: threatActorId },
    });
    this.setState({ sub });
  }

  componentWillUnmount() {
    this.state.sub.dispose();
  }

  render() {
    const {
      me,
      match: {
        params: { threatActorId },
      },
    } = this.props;
    return (
      <div>
        <TopBar me={me || null} />
        <QueryRenderer
          query={threatActorQuery}
          variables={{ id: threatActorId }}
          render={({ props }) => {
            if (props && props.threatActor) {
              return (
                <div>
                  <Route
                    exact
                    path="/dashboard/threats/threat_actors/:threatActorId"
                    render={(routeProps) => (
                      <ThreatActor
                        {...routeProps}
                        threatActor={props.threatActor}
                      />
                    )}
                  />
                  <Route
                    exact
                    path="/dashboard/threats/threat_actors/:threatActorId/reports"
                    render={(routeProps) => (
                      <ThreatActorReports
                        {...routeProps}
                        threatActor={props.threatActor}
                      />
                    )}
                  />
                  <Route
                    exact
                    path="/dashboard/threats/threat_actors/:threatActorId/knowledge"
                    render={() => (
                      <Redirect
                        to={`/dashboard/threats/threat_actors/${threatActorId}/knowledge/overview`}
                      />
                    )}
                  />
                  <Route
                    path="/dashboard/threats/threat_actors/:threatActorId/knowledge"
                    render={(routeProps) => (
                      <ThreatActorKnowledge
                        {...routeProps}
                        threatActor={props.threatActor}
                      />
                    )}
                  />
                  <Route
                    path="/dashboard/threats/threat_actors/:threatActorId/indicators"
                    render={(routeProps) => (
                      <ThreatActorIndicators
                        {...routeProps}
                        threatActor={props.threatActor}
                      />
                    )}
                  />
                  <Route
                    exact
                    path="/dashboard/threats/threat_actors/:threatActorId/files"
                    render={(routeProps) => (
                      <React.Fragment>
                        <StixDomainObjectHeader
                          stixDomainObject={props.threatActor}
                          PopoverComponent={<ThreatActorPopover />}
                        />
                        <FileManager
                          {...routeProps}
                          id={threatActorId}
                          connectorsExport={props.connectorsForExport}
                          entity={props.threatActor}
                        />
                      </React.Fragment>
                    )}
                  />
                  <Route
                    exact
                    path="/dashboard/threats/threat_actors/:threatActorId/history"
                    render={(routeProps) => (
                      <React.Fragment>
                        <StixDomainObjectHeader
                          stixDomainObject={props.threatActor}
                          PopoverComponent={<ThreatActorPopover />}
                        />
                        <StixCoreObjectHistory
                          {...routeProps}
                          stixCoreObjectStandardId={
                            props.threatActor.standard_id
                          }
                        />
                      </React.Fragment>
                    )}
                  />
                </div>
              );
            }
            return <Loader />;
          }}
        />
      </div>
    );
  }
}

RootThreatActor.propTypes = {
  children: PropTypes.node,
  match: PropTypes.object,
  me: PropTypes.object,
};

export default withRouter(RootThreatActor);
