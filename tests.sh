
###############
# shell tests #
###############

deathstar -S
# choose sh
# check if config.shell == sh

deathstar -S
# choose zsh
# check if config.shell == zsh

#######################
# defaul script tests #
#######################

# try running default script with no saved scripts
deathstar -R
# check if output says 'no saved scripts'

# save scripts
deathstar -s examples/batmobile.yml
deathstar -s examples/batplane.yml

# try tunning default script with saved scripts but no default script set
deathstar -R
# check if output says 'no default script set'

# set default script
deathstar -D batmobile
# check if config.defaultScript == batmobile

# set default script
deathstar -D batplane
# check if config.defaultScript == batplane

# check if default script runs
deathstar -R
# check if batplane runs

######################
# list scripts tests #
######################

deathstar -l
# check if
