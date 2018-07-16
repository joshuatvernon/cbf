
###############
# shell tests #
###############

pyr -S
# choose sh
# check if config.shell == sh

pyr -S
# choose zsh
# check if config.shell == zsh

#######################
# defaul script tests #
#######################

# try running default script with no saved scripts
pyr -R
# check if output says 'no saved scripts'

# save scripts
pyr -s examples/batmobile.yml
pyr -s examples/batplane.yml

# try tunning default script with saved scripts but no default script set
pyr -R
# check if output says 'no default script set'

# set default script
pyr -D batmobile
# check if config.defaultScript == batmobile

# set default script
pyr -D batplane
# check if config.defaultScript == batplane

# check if default script runs
pyr -R
# check if batplane runs

######################
# list scripts tests #
######################

pyr -l
# check if
